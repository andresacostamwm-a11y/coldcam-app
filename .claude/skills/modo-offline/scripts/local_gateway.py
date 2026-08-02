#!/usr/bin/env python3
"""Gateway offline compatible con la API de Anthropic.

Expone /v1/messages con el contrato de la Messages API de Anthropic y lo traduce
a un backend local (Ollama por defecto). Asi, cualquier cliente que hable
"Anthropic" — Claude Code via ANTHROPIC_BASE_URL, el SDK `anthropic` de
app/main.py, curl — sigue funcionando sin internet.

Solo stdlib: no necesita instalar nada (que es justo el punto estando offline).

Uso:
    python3 scripts/local_gateway.py                 # escucha en 127.0.0.1:8787
    python3 scripts/local_gateway.py --port 9000 --model qwen2.5-coder:7b
    OFFLINE_MODEL=llama3.1:8b python3 scripts/local_gateway.py

Cliente:
    export ANTHROPIC_BASE_URL=http://127.0.0.1:8787
    export ANTHROPIC_API_KEY=offline    # el gateway no valida, pero los SDK lo exigen
    claude

Limitaciones reales (no las disimules ante el usuario):
  - La calidad es la del modelo local, no la de Claude. Espera peor razonamiento
    de codigo largo y peor seguimiento de instrucciones.
  - Las imagenes (bloques `image`) se descartan con un aviso: los modelos de texto
    locales no las procesan.
  - `tools` se traduce a function calling de Ollama; si el modelo local no soporta
    tools, el gateway lo reporta en la respuesta en vez de fallar en silencio.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

BACKEND = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
DEFAULT_MODEL = os.getenv("OFFLINE_MODEL", "qwen2.5-coder:7b")

# Mapea nombres de modelos Claude -> modelo local. Se puede sobreescribir con
# OFFLINE_MODEL_MAP='{"claude-opus-5":"qwen2.5-coder:32b"}'
MODEL_MAP: dict[str, str] = json.loads(os.getenv("OFFLINE_MODEL_MAP", "{}"))

VERBOSE = os.getenv("OFFLINE_GATEWAY_VERBOSE", "1") not in {"0", "false", ""}


def log(msg: str) -> None:
    if VERBOSE:
        print(f"[gateway] {msg}", file=sys.stderr, flush=True)


# ── Traduccion Anthropic -> backend local ────────────────────────────────────

def _text_from_blocks(content) -> tuple[str, list[dict], list[str]]:
    """Aplana `content` de Anthropic. Devuelve (texto, tool_results, avisos)."""
    if isinstance(content, str):
        return content, [], []
    partes: list[str] = []
    tool_results: list[dict] = []
    avisos: list[str] = []
    for block in content or []:
        if not isinstance(block, dict):
            partes.append(str(block))
            continue
        btype = block.get("type")
        if btype == "text":
            partes.append(block.get("text", ""))
        elif btype == "tool_use":
            partes.append(f"[llamada a herramienta {block.get('name')} "
                          f"args={json.dumps(block.get('input', {}), ensure_ascii=False)}]")
        elif btype == "tool_result":
            payload = block.get("content")
            texto, _, _ = _text_from_blocks(payload) if not isinstance(payload, str) else (payload, [], [])
            tool_results.append({"tool_call_id": block.get("tool_use_id", ""), "content": texto})
        elif btype == "image":
            avisos.append("bloque de imagen descartado: el backend local es solo texto")
        elif btype == "thinking":
            continue
        else:
            partes.append(json.dumps(block, ensure_ascii=False))
    return "\n".join(p for p in partes if p), tool_results, avisos


def anthropic_to_backend(req: dict) -> tuple[dict, list[str]]:
    """Convierte un request de /v1/messages al payload de /api/chat de Ollama."""
    avisos: list[str] = []
    mensajes: list[dict] = []

    system = req.get("system")
    if system:
        texto, _, w = _text_from_blocks(system)
        avisos += w
        if texto:
            mensajes.append({"role": "system", "content": texto})

    for m in req.get("messages", []):
        rol = m.get("role", "user")
        texto, tool_results, w = _text_from_blocks(m.get("content"))
        avisos += w
        for tr in tool_results:
            mensajes.append({"role": "tool", "content": tr["content"]})
        if texto:
            mensajes.append({"role": rol, "content": texto})

    opciones: dict = {}
    if req.get("max_tokens") is not None:
        opciones["num_predict"] = int(req["max_tokens"])
    for src, dst in (("temperature", "temperature"), ("top_p", "top_p"), ("top_k", "top_k")):
        if req.get(src) is not None:
            opciones[dst] = req[src]
    if req.get("stop_sequences"):
        opciones["stop"] = req["stop_sequences"]

    modelo_pedido = req.get("model", "")
    modelo = MODEL_MAP.get(modelo_pedido) or os.getenv("OFFLINE_MODEL", DEFAULT_MODEL)

    payload: dict = {"model": modelo, "messages": mensajes, "options": opciones}

    herramientas = req.get("tools") or []
    if herramientas:
        payload["tools"] = [
            {"type": "function",
             "function": {"name": t.get("name", ""),
                          "description": t.get("description", ""),
                          "parameters": t.get("input_schema", {"type": "object"})}}
            for t in herramientas if isinstance(t, dict)
        ]
    return payload, avisos


def backend_to_anthropic(data: dict, modelo_pedido: str) -> dict:
    """Convierte la respuesta de /api/chat de Ollama al shape de Anthropic."""
    mensaje = data.get("message", {}) or {}
    bloques: list[dict] = []

    texto = mensaje.get("content", "") or ""
    if texto:
        bloques.append({"type": "text", "text": texto})

    for i, call in enumerate(mensaje.get("tool_calls", []) or []):
        fn = call.get("function", {}) or {}
        args = fn.get("arguments", {})
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError:
                args = {"_raw": args}
        bloques.append({"type": "tool_use",
                        "id": f"toolu_{uuid.uuid4().hex[:20]}",
                        "name": fn.get("name", f"tool_{i}"),
                        "input": args})

    if not bloques:
        bloques.append({"type": "text", "text": ""})

    tiene_tools = any(b["type"] == "tool_use" for b in bloques)
    razon = data.get("done_reason", "stop")
    stop_reason = "tool_use" if tiene_tools else {"stop": "end_turn", "length": "max_tokens"}.get(razon, "end_turn")

    return {
        "id": f"msg_{uuid.uuid4().hex[:24]}",
        "type": "message",
        "role": "assistant",
        "model": modelo_pedido or data.get("model", ""),
        "content": bloques,
        "stop_reason": stop_reason,
        "stop_sequence": None,
        "usage": {"input_tokens": data.get("prompt_eval_count", 0),
                  "output_tokens": data.get("eval_count", 0)},
    }


# ── Llamadas al backend ──────────────────────────────────────────────────────

def backend_post(path: str, payload: dict, stream: bool, timeout: float):
    body = json.dumps({**payload, "stream": stream}).encode("utf-8")
    req = urllib.request.Request(f"{BACKEND}{path}", data=body,
                                 headers={"Content-Type": "application/json"})
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    return opener.open(req, timeout=timeout)


def backend_alive(timeout: float = 1.5) -> tuple[bool, list[str]]:
    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(f"{BACKEND}/api/tags", timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8") or "{}")
        return True, [m.get("name", "?") for m in data.get("models", [])]
    except Exception:  # noqa: BLE001
        return False, []


# ── Servidor HTTP ────────────────────────────────────────────────────────────

class Handler(BaseHTTPRequestHandler):
    server_version = "OfflineAnthropicGateway/1.0"
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt: str, *args) -> None:  # silencia el log por defecto
        if VERBOSE:
            sys.stderr.write(f"[gateway] {self.address_string()} {fmt % args}\n")

    # -- helpers -------------------------------------------------------------
    def _send_json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _error(self, code: int, tipo: str, mensaje: str) -> None:
        log(f"error {code}: {mensaje}")
        self._send_json(code, {"type": "error", "error": {"type": tipo, "message": mensaje}})

    def _sse(self, event: str, data: dict) -> None:
        chunk = f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
        self.wfile.write(chunk.encode("utf-8"))
        self.wfile.flush()

    def _read_body(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        return json.loads(raw.decode("utf-8") or "{}")

    # -- rutas ---------------------------------------------------------------
    def do_GET(self) -> None:  # noqa: N802
        ruta = self.path.split("?")[0]
        if ruta == "/health":
            alive, modelos = backend_alive()
            self._send_json(200, {"status": "ok" if alive else "sin_backend",
                                  "backend": BACKEND,
                                  "backend_reachable": alive,
                                  "modelo_por_defecto": os.getenv("OFFLINE_MODEL", DEFAULT_MODEL),
                                  "modelos": modelos,
                                  "model_map": MODEL_MAP})
        elif ruta in ("/v1/models", "/models"):
            _, modelos = backend_alive()
            self._send_json(200, {"data": [{"id": m, "type": "model"} for m in modelos]})
        else:
            self._error(404, "not_found_error", f"ruta desconocida: {ruta}")

    def do_POST(self) -> None:  # noqa: N802
        ruta = self.path.split("?")[0]
        if ruta not in ("/v1/messages", "/v1/complete"):
            self._error(404, "not_found_error", f"ruta desconocida: {ruta}")
            return
        try:
            req = self._read_body()
        except json.JSONDecodeError as exc:
            self._error(400, "invalid_request_error", f"JSON invalido: {exc}")
            return

        alive, _ = backend_alive()
        if not alive:
            self._error(503, "api_error",
                        f"No hay backend local en {BACKEND}. Arranca `ollama serve` "
                        f"y descarga un modelo con `ollama pull {DEFAULT_MODEL}`.")
            return

        payload, avisos = anthropic_to_backend(req)
        for a in set(avisos):
            log(f"aviso: {a}")

        if req.get("stream"):
            self._stream(req, payload)
        else:
            self._once(req, payload)

    def _once(self, req: dict, payload: dict) -> None:
        try:
            with backend_post("/api/chat", payload, stream=False, timeout=600) as resp:
                data = json.loads(resp.read().decode("utf-8") or "{}")
        except urllib.error.HTTPError as exc:
            self._error(502, "api_error", f"backend respondio {exc.code}: {exc.read().decode('utf-8', 'replace')[:400]}")
            return
        except Exception as exc:  # noqa: BLE001
            self._error(502, "api_error", f"fallo hablando con el backend: {exc}")
            return
        self._send_json(200, backend_to_anthropic(data, req.get("model", "")))

    def _stream(self, req: dict, payload: dict) -> None:
        """Emite la secuencia de eventos SSE que espera un cliente Anthropic."""
        msg_id = f"msg_{uuid.uuid4().hex[:24]}"
        modelo = req.get("model", payload["model"])
        try:
            resp = backend_post("/api/chat", payload, stream=True, timeout=600)
        except Exception as exc:  # noqa: BLE001
            self._error(502, "api_error", f"fallo hablando con el backend: {exc}")
            return

        # Sin Content-Length, el cuerpo SSE termina cuando cierra la conexion:
        # hay que anunciarlo o el cliente se queda esperando para siempre.
        self.close_connection = True
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "close")
        self.end_headers()

        self._sse("message_start", {
            "type": "message_start",
            "message": {"id": msg_id, "type": "message", "role": "assistant",
                        "model": modelo, "content": [], "stop_reason": None,
                        "stop_sequence": None,
                        "usage": {"input_tokens": 0, "output_tokens": 0}}})
        self._sse("content_block_start", {"type": "content_block_start", "index": 0,
                                          "content_block": {"type": "text", "text": ""}})

        entrada = salida = 0
        stop_reason = "end_turn"
        indice = 0
        tool_blocks: list[dict] = []

        with resp:
            for linea in resp:
                linea = linea.strip()
                if not linea:
                    continue
                try:
                    evento = json.loads(linea.decode("utf-8"))
                except json.JSONDecodeError:
                    continue

                mensaje = evento.get("message", {}) or {}
                fragmento = mensaje.get("content", "") or ""
                if fragmento:
                    self._sse("content_block_delta", {
                        "type": "content_block_delta", "index": indice,
                        "delta": {"type": "text_delta", "text": fragmento}})

                for call in mensaje.get("tool_calls", []) or []:
                    tool_blocks.append(call)

                if evento.get("done"):
                    entrada = evento.get("prompt_eval_count", 0)
                    salida = evento.get("eval_count", 0)
                    razon = evento.get("done_reason", "stop")
                    stop_reason = {"stop": "end_turn", "length": "max_tokens"}.get(razon, "end_turn")

        self._sse("content_block_stop", {"type": "content_block_stop", "index": indice})

        # Los tool_calls llegan completos (Ollama no los trocea): un bloque por llamada.
        for call in tool_blocks:
            indice += 1
            fn = call.get("function", {}) or {}
            args = fn.get("arguments", {})
            if isinstance(args, str):
                try:
                    args = json.loads(args)
                except json.JSONDecodeError:
                    args = {"_raw": args}
            self._sse("content_block_start", {
                "type": "content_block_start", "index": indice,
                "content_block": {"type": "tool_use",
                                  "id": f"toolu_{uuid.uuid4().hex[:20]}",
                                  "name": fn.get("name", "tool"), "input": {}}})
            self._sse("content_block_delta", {
                "type": "content_block_delta", "index": indice,
                "delta": {"type": "input_json_delta",
                          "partial_json": json.dumps(args, ensure_ascii=False)}})
            self._sse("content_block_stop", {"type": "content_block_stop", "index": indice})
            stop_reason = "tool_use"

        self._sse("message_delta", {"type": "message_delta",
                                    "delta": {"stop_reason": stop_reason, "stop_sequence": None},
                                    "usage": {"input_tokens": entrada, "output_tokens": salida}})
        self._sse("message_stop", {"type": "message_stop"})


def main() -> int:
    ap = argparse.ArgumentParser(description="Gateway offline compatible con la API de Anthropic")
    ap.add_argument("--host", default=os.getenv("OFFLINE_GATEWAY_HOST", "127.0.0.1"))
    ap.add_argument("--port", type=int, default=int(os.getenv("OFFLINE_GATEWAY_PORT", "8787")))
    ap.add_argument("--model", help="modelo local por defecto (equivale a OFFLINE_MODEL)")
    ap.add_argument("--check", action="store_true", help="solo verifica el backend y sale")
    args = ap.parse_args()

    if args.model:
        os.environ["OFFLINE_MODEL"] = args.model

    alive, modelos = backend_alive()
    if args.check:
        print(json.dumps({"backend": BACKEND, "reachable": alive, "modelos": modelos},
                         indent=2, ensure_ascii=False))
        return 0 if alive else 1

    if not alive:
        log(f"AVISO: backend {BACKEND} no responde. El gateway arranca igual y "
            f"devolvera 503 hasta que hagas `ollama serve`.")
    else:
        log(f"backend {BACKEND} ok, modelos: {', '.join(modelos) or 'ninguno'}")

    servidor = ThreadingHTTPServer((args.host, args.port), Handler)
    log(f"escuchando en http://{args.host}:{args.port}")
    log(f"usa:  export ANTHROPIC_BASE_URL=http://{args.host}:{args.port}")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        log("apagando")
    finally:
        servidor.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
