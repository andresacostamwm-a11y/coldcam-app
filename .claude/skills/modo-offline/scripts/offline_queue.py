#!/usr/bin/env python3
"""Cola de tareas offline.

Sin red hay cosas que simplemente no se pueden hacer (buscar en web, MCP remotos,
pedir el modelo grande de la nube). En vez de bloquear la sesion, se anotan aqui
con todo el contexto necesario y se despachan en cuanto vuelve la conexion.

Uso:
    python3 scripts/offline_queue.py add "Revisar precios de la API" --necesita nube
    python3 scripts/offline_queue.py add "Refactor de agents/" --necesita local --prioridad alta
    python3 scripts/offline_queue.py list
    python3 scripts/offline_queue.py list --pendientes
    python3 scripts/offline_queue.py show 3
    python3 scripts/offline_queue.py nota 3 "probado con qwen, falla el parser"
    python3 scripts/offline_queue.py done 3
    python3 scripts/offline_queue.py drop 3
    python3 scripts/offline_queue.py briefing          # markdown para pegarle a Claude al reconectar
    python3 scripts/offline_queue.py briefing --out .offline/briefing.md

El almacen es .offline/queue.json en la raiz del repo (ignorado por git).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]
STORE = Path(os.getenv("OFFLINE_QUEUE_PATH") or REPO / ".offline" / "queue.json")

NECESITA = ("nube", "local", "manual")
PRIORIDADES = ("alta", "media", "baja")
ORDEN_PRIORIDAD = {"alta": 0, "media": 1, "baja": 2}


def ahora() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def cargar() -> dict:
    if not STORE.exists():
        return {"version": 1, "tareas": []}
    try:
        datos = json.loads(STORE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        print(f"error: no se pudo leer {STORE}: {exc}", file=sys.stderr)
        raise SystemExit(1)
    datos.setdefault("tareas", [])
    return datos


def guardar(datos: dict) -> None:
    STORE.parent.mkdir(parents=True, exist_ok=True)
    tmp = STORE.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(datos, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(STORE)


def buscar(datos: dict, tid: int) -> dict:
    for t in datos["tareas"]:
        if t["id"] == tid:
            return t
    print(f"error: no existe la tarea {tid}", file=sys.stderr)
    raise SystemExit(1)


# ── comandos ─────────────────────────────────────────────────────────────────

def cmd_add(args: argparse.Namespace) -> int:
    datos = cargar()
    tid = max((t["id"] for t in datos["tareas"]), default=0) + 1
    tarea = {
        "id": tid,
        "titulo": args.titulo,
        "necesita": args.necesita,
        "prioridad": args.prioridad,
        "estado": "pendiente",
        "contexto": args.contexto or "",
        "archivos": args.archivo or [],
        "notas": [],
        "creada": ahora(),
        "cerrada": None,
    }
    datos["tareas"].append(tarea)
    guardar(datos)
    print(f"#{tid} encolada [{args.necesita}/{args.prioridad}] {args.titulo}")
    return 0


def cmd_list(args: argparse.Namespace) -> int:
    datos = cargar()
    tareas = datos["tareas"]
    if args.pendientes:
        tareas = [t for t in tareas if t["estado"] == "pendiente"]
    if args.necesita:
        tareas = [t for t in tareas if t["necesita"] == args.necesita]
    if not tareas:
        print("cola vacia")
        return 0
    tareas.sort(key=lambda t: (t["estado"] != "pendiente",
                               ORDEN_PRIORIDAD.get(t["prioridad"], 9), t["id"]))
    ancho = max(len(t["titulo"]) for t in tareas)
    print(f"{'ID':>3}  {'':<3} {'ESTADO':<10} {'NECESITA':<9} {'PRIO':<6} TITULO")
    print("-" * (38 + ancho))
    for t in tareas:
        marca = "[x]" if t["estado"] == "hecha" else "[ ]"
        print(f"{t['id']:>3}  {marca:<3} {t['estado']:<10} {t['necesita']:<9} "
              f"{t['prioridad']:<6} {t['titulo']}")
    pend = sum(1 for t in datos["tareas"] if t["estado"] == "pendiente")
    print(f"\n{pend} pendiente(s) de {len(datos['tareas'])} en total  ->  {STORE}")
    return 0


def cmd_show(args: argparse.Namespace) -> int:
    t = buscar(cargar(), args.id)
    print(json.dumps(t, indent=2, ensure_ascii=False))
    return 0


def cmd_nota(args: argparse.Namespace) -> int:
    datos = cargar()
    t = buscar(datos, args.id)
    t["notas"].append({"cuando": ahora(), "texto": args.texto})
    guardar(datos)
    print(f"#{t['id']} nota agregada ({len(t['notas'])} en total)")
    return 0


def cmd_done(args: argparse.Namespace) -> int:
    datos = cargar()
    t = buscar(datos, args.id)
    t["estado"] = "hecha"
    t["cerrada"] = ahora()
    guardar(datos)
    print(f"#{t['id']} marcada como hecha: {t['titulo']}")
    return 0


def cmd_drop(args: argparse.Namespace) -> int:
    datos = cargar()
    t = buscar(datos, args.id)
    datos["tareas"] = [x for x in datos["tareas"] if x["id"] != args.id]
    guardar(datos)
    print(f"#{args.id} eliminada: {t['titulo']}")
    return 0


def cmd_briefing(args: argparse.Namespace) -> int:
    """Markdown con todo lo pendiente, listo para pegarle a Claude al reconectar."""
    datos = cargar()
    pendientes = [t for t in datos["tareas"] if t["estado"] == "pendiente"]
    pendientes.sort(key=lambda t: (ORDEN_PRIORIDAD.get(t["prioridad"], 9), t["id"]))

    lineas = [f"# Trabajo acumulado offline ({ahora()})", ""]
    if not pendientes:
        lineas.append("Sin tareas pendientes.")
    else:
        lineas.append(f"{len(pendientes)} tarea(s) pendientes acumuladas sin conexion. "
                      "Retomalas en este orden:")
        lineas.append("")
        for t in pendientes:
            lineas.append(f"## #{t['id']} — {t['titulo']}")
            lineas.append(f"- Prioridad: **{t['prioridad']}** · Necesita: **{t['necesita']}** "
                          f"· Encolada: {t['creada']}")
            if t["archivos"]:
                lineas.append(f"- Archivos: {', '.join(f'`{a}`' for a in t['archivos'])}")
            if t["contexto"]:
                lineas.append(f"- Contexto: {t['contexto']}")
            for n in t["notas"]:
                lineas.append(f"  - nota ({n['cuando']}): {n['texto']}")
            lineas.append("")
    texto = "\n".join(lineas)

    if args.out:
        destino = Path(args.out)
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(texto, encoding="utf-8")
        print(f"briefing escrito en {destino} ({len(pendientes)} tareas)")
    else:
        print(texto)
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Cola de tareas offline")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("add", help="encolar una tarea")
    p.add_argument("titulo")
    p.add_argument("--necesita", choices=NECESITA, default="nube",
                   help="nube = requiere internet; local = se puede con modelo local; manual = a mano")
    p.add_argument("--prioridad", choices=PRIORIDADES, default="media")
    p.add_argument("--contexto", help="por que y con que datos")
    p.add_argument("--archivo", action="append", help="archivo relacionado (repetible)")
    p.set_defaults(func=cmd_add)

    p = sub.add_parser("list", help="listar tareas")
    p.add_argument("--pendientes", action="store_true")
    p.add_argument("--necesita", choices=NECESITA)
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("show", help="ver una tarea completa")
    p.add_argument("id", type=int)
    p.set_defaults(func=cmd_show)

    p = sub.add_parser("nota", help="agregar nota a una tarea")
    p.add_argument("id", type=int)
    p.add_argument("texto")
    p.set_defaults(func=cmd_nota)

    p = sub.add_parser("done", help="marcar como hecha")
    p.add_argument("id", type=int)
    p.set_defaults(func=cmd_done)

    p = sub.add_parser("drop", help="eliminar tarea")
    p.add_argument("id", type=int)
    p.set_defaults(func=cmd_drop)

    p = sub.add_parser("briefing", help="markdown de pendientes para retomar al reconectar")
    p.add_argument("--out", help="ruta de salida en vez de stdout")
    p.set_defaults(func=cmd_briefing)

    args = ap.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
