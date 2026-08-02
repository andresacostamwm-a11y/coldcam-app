#!/usr/bin/env python3
"""Diagnostico de modo offline.

Revisa que hay disponible sin internet y que hace falta para seguir trabajando:
conectividad real, backend de modelo local, gateway, dependencias vendorizadas
y herramientas del sistema. Imprime una matriz de capacidades y los comandos
recomendados para el estado detectado.

Uso:
    python3 scripts/offline_doctor.py
    python3 scripts/offline_doctor.py --json
    python3 scripts/offline_doctor.py --timeout 1.5
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import socket
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
GATEWAY_URL = os.getenv("OFFLINE_GATEWAY_URL", "http://127.0.0.1:8787").rstrip("/")

# Host, puerto, para que sirve
INTERNET_TARGETS = [
    ("api.anthropic.com", 443, "API de Claude (inferencia en la nube)"),
    ("registry.npmjs.org", 443, "Paquetes npm"),
    ("pypi.org", 443, "Paquetes pip"),
]

OK, WARN, BAD = "OK", "AVISO", "FALLA"


def tcp_reachable(host: str, port: int, timeout: float) -> tuple[bool, str]:
    """Prueba TCP directa. Devuelve (alcanzable, detalle)."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True, "conexion establecida"
    except socket.gaierror as exc:
        return False, f"DNS no resuelve ({exc.strerror or exc})"
    except (socket.timeout, TimeoutError):
        return False, f"timeout tras {timeout}s"
    except OSError as exc:
        return False, str(exc)


def http_json(url: str, timeout: float) -> tuple[bool, object]:
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        # Los proxys de red no aplican a localhost; evitamos que el entorno lo fuerce.
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(req, timeout=timeout) as resp:
            return True, json.loads(resp.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as exc:
        return False, f"HTTP {exc.code}"
    except Exception as exc:  # noqa: BLE001 - diagnostico, cualquier fallo es dato
        return False, str(exc)


def check_internet(timeout: float) -> dict:
    results = []
    for host, port, purpose in INTERNET_TARGETS:
        reachable, detail = tcp_reachable(host, port, timeout)
        results.append({"host": host, "port": port, "purpose": purpose,
                        "reachable": reachable, "detail": detail})
    anthropic_up = results[0]["reachable"]
    any_up = any(r["reachable"] for r in results)
    if anthropic_up:
        mode = "online"
    elif any_up:
        mode = "degradado"
    else:
        mode = "offline"
    return {"mode": mode, "targets": results,
            "proxy": {k: v for k, v in os.environ.items()
                      if k.upper() in {"HTTPS_PROXY", "HTTP_PROXY", "NO_PROXY"}}}


def check_local_model(timeout: float) -> dict:
    ok, payload = http_json(f"{OLLAMA_HOST}/api/tags", timeout)
    models = []
    if ok and isinstance(payload, dict):
        models = [m.get("name", "?") for m in payload.get("models", [])]
    return {"host": OLLAMA_HOST, "reachable": ok, "models": models,
            "detail": "" if ok else str(payload),
            "binary": shutil.which("ollama") or ""}


def check_gateway(timeout: float) -> dict:
    ok, payload = http_json(f"{GATEWAY_URL}/health", timeout)
    return {"url": GATEWAY_URL, "running": ok,
            "detail": payload if ok else str(payload)}


def check_tools() -> dict:
    wanted = ["git", "python3", "node", "npm", "ollama", "rg", "curl"]
    return {name: shutil.which(name) or "" for name in wanted}


def check_vendored() -> dict:
    """Dependencias ya descargadas: lo unico usable sin red."""
    pip_cache = REPO / ".offline" / "wheels"
    node_modules = REPO / "video" / "node_modules"
    skills = REPO / ".claude" / "skills"
    venv = REPO / ".venv"
    try:
        wheels = len(list(pip_cache.glob("*.whl"))) if pip_cache.is_dir() else 0
    except OSError:
        wheels = 0
    return {
        "wheels_offline": {"path": str(pip_cache), "count": wheels},
        "node_modules": {"path": str(node_modules), "present": node_modules.is_dir()},
        "skills_locales": {"path": str(skills),
                           "count": len(list(skills.iterdir())) if skills.is_dir() else 0},
        "venv": {"path": str(venv), "present": venv.is_dir()},
    }


def check_git() -> dict:
    def run(*args: str) -> str:
        try:
            out = subprocess.run(["git", *args], cwd=REPO, capture_output=True,
                                 text=True, timeout=10)
            return out.stdout.strip() if out.returncode == 0 else ""
        except (OSError, subprocess.SubprocessError):
            return ""

    return {"branch": run("rev-parse", "--abbrev-ref", "HEAD"),
            "dirty": bool(run("status", "--porcelain")),
            "unpushed": run("log", "--oneline", "@{u}..HEAD") if run("rev-parse", "@{u}") else "sin upstream"}


def capability_matrix(net: dict, model: dict, gateway: dict, tools: dict, vendored: dict) -> list[dict]:
    """Que se puede hacer AHORA MISMO, con el estado detectado."""
    online = net["mode"] == "online"
    local_llm = model["reachable"] and bool(model["models"])
    gw = gateway["running"]

    def row(nombre: str, estado: str, nota: str) -> dict:
        return {"capacidad": nombre, "estado": estado, "nota": nota}

    rows = [
        row("Claude / Claude Code contra la nube",
            OK if online else BAD,
            "api.anthropic.com alcanzable" if online
            else "sin ruta a api.anthropic.com: usa el gateway local"),
        row("Claude Code contra modelo local",
            OK if (gw and local_llm) else (WARN if local_llm else BAD),
            "ANTHROPIC_BASE_URL=" + gateway["url"] if (gw and local_llm)
            else ("modelo local listo, arranca el gateway" if local_llm
                  else "no hay backend local (ollama serve + ollama pull)")),
        row("Editar, refactorizar y leer codigo",
            OK, "Read/Edit/Grep/Bash son locales, no dependen de red"),
        row("Git local (commit, branch, diff, stash)",
            OK if tools["git"] else BAD,
            "push/fetch requieren red" if tools["git"] else "git no instalado"),
        row("Ejecutar la app (uvicorn run.py)",
            OK if vendored["venv"]["present"] or tools["python3"] else WARN,
            "las rutas que llaman a la API de Claude fallaran sin red o sin gateway"),
        row("Instalar dependencias nuevas",
            OK if online else (WARN if vendored["wheels_offline"]["count"] else BAD),
            "pip/npm normales" if online
            else f"solo desde .offline/wheels ({vendored['wheels_offline']['count']} wheels)"),
        row("Diseno / design code (HTML, CSS, SVG, PPTX, DOCX)",
            OK, "obligatorio: cero CDN, todo self-contained (ver references/diseno-offline.md)"),
        row("Frontend del video/ (npm run)",
            OK if vendored["node_modules"]["present"] else BAD,
            "node_modules presente" if vendored["node_modules"]["present"]
            else "falta npm install (hazlo con red)"),
        row("Skills locales del repo",
            OK if vendored["skills_locales"]["count"] else BAD,
            f"{vendored['skills_locales']['count']} skills en disco, se leen sin red"),
        row("Busqueda web / WebFetch / MCP remotos",
            OK if online else BAD,
            "disponible" if online else "imposible sin red: usa la cola offline"),
    ]
    return rows


def recommendations(net: dict, model: dict, gateway: dict) -> list[str]:
    recs: list[str] = []
    mode = net["mode"]
    if mode == "online":
        recs.append("Estas ONLINE: aprovecha para correr `bash scripts/offline_pack.sh` "
                    "y dejar todo vendorizado antes de perder la red.")
        if not model["models"]:
            recs.append("No hay modelos locales descargados. Ejecuta: "
                        "ollama pull qwen2.5-coder:7b")
    else:
        recs.append(f"Estado de red: {mode.upper()}.")
        if not model["binary"]:
            recs.append("No hay binario de ollama. Sin backend local no hay inferencia offline; "
                        "trabaja en modo manual y encola tareas: "
                        "python3 scripts/offline_queue.py add \"...\"")
        elif not model["reachable"]:
            recs.append("Arranca el backend local: ollama serve")
        elif not model["models"]:
            recs.append("Backend arriba pero sin modelos. Necesitas haber hecho `ollama pull` con red.")
        elif not gateway["running"]:
            recs.append("Arranca el gateway: python3 scripts/local_gateway.py &  "
                        "y exporta ANTHROPIC_BASE_URL=" + gateway["url"])
        else:
            recs.append("Gateway y modelo local listos. Claude Code puede trabajar offline con "
                        "ANTHROPIC_BASE_URL=" + gateway["url"])
        recs.append("Todo lo que necesite la nube (busqueda web, MCP remoto, modelos grandes) "
                    "va a la cola: python3 scripts/offline_queue.py add \"tarea\" --necesita nube")
    return recs


def render(report: dict) -> str:
    net, model, gw = report["red"], report["modelo_local"], report["gateway"]
    lines: list[str] = []
    lines.append("=" * 72)
    lines.append(f"  DIAGNOSTICO MODO OFFLINE  ->  estado de red: {net['mode'].upper()}")
    lines.append("=" * 72)

    lines.append("\n[ Conectividad ]")
    for t in net["targets"]:
        mark = "si " if t["reachable"] else "NO "
        lines.append(f"  {mark} {t['host']}:{t['port']:<5} {t['purpose']}  ({t['detail']})")
    if net["proxy"]:
        for k, v in net["proxy"].items():
            lines.append(f"  proxy {k}={v}")

    lines.append("\n[ Backend de modelo local ]")
    lines.append(f"  host      : {model['host']}  ({'alcanzable' if model['reachable'] else model['detail']})")
    lines.append(f"  binario   : {model['binary'] or 'no instalado'}")
    lines.append(f"  modelos   : {', '.join(model['models']) if model['models'] else 'ninguno descargado'}")
    lines.append(f"  gateway   : {gw['url']}  ({'ACTIVO' if gw['running'] else 'apagado'})")

    lines.append("\n[ Herramientas ]")
    for name, path in report["herramientas"].items():
        lines.append(f"  {'si ' if path else 'NO '} {name}")

    lines.append("\n[ Matriz de capacidades ]")
    width = max(len(r["capacidad"]) for r in report["capacidades"])
    for r in report["capacidades"]:
        lines.append(f"  {r['estado']:<5} | {r['capacidad']:<{width}} | {r['nota']}")

    g = report["git"]
    lines.append("\n[ Git ]")
    lines.append(f"  rama {g['branch'] or '?'} | cambios sin commitear: {'si' if g['dirty'] else 'no'} "
                 f"| pendientes de push: {g['unpushed'] or 'ninguno'}")

    lines.append("\n[ Recomendaciones ]")
    for i, rec in enumerate(report["recomendaciones"], 1):
        lines.append(f"  {i}. {rec}")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(description="Diagnostico de modo offline")
    ap.add_argument("--json", action="store_true", help="salida JSON")
    ap.add_argument("--timeout", type=float, default=2.0, help="timeout por sonda en segundos")
    args = ap.parse_args()

    net = check_internet(args.timeout)
    model = check_local_model(min(args.timeout, 1.5))
    gateway = check_gateway(min(args.timeout, 1.5))
    tools = check_tools()
    vendored = check_vendored()

    report = {
        "red": net,
        "modelo_local": model,
        "gateway": gateway,
        "herramientas": tools,
        "vendorizado": vendored,
        "git": check_git(),
        "capacidades": capability_matrix(net, model, gateway, tools, vendored),
        "recomendaciones": recommendations(net, model, gateway),
    }

    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print(render(report))
    return 0


if __name__ == "__main__":
    sys.exit(main())
