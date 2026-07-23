"""AI Personal Assistant — FastAPI Backend"""
from __future__ import annotations
import os, json, imaplib, email as email_lib, smtplib, uuid, asyncio, ast, logging, secrets, operator
from email.header import decode_header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import anthropic
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("assistant")

ENV            = os.getenv("ENV", "prod")
APP_API_TOKEN  = os.getenv("APP_API_TOKEN", "")
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:8000").split(",") if o.strip()]

if not APP_API_TOKEN:
    logger.warning(
        "APP_API_TOKEN is not set — all /api/* routes will reject requests. "
        "Set APP_API_TOKEN in your environment to enable the API."
    )

# ── App setup ─────────────────────────────────────────────────────────────────
# Docs/OpenAPI schema are only exposed in development to avoid leaking the API map.
app = FastAPI(
    title="AI Personal Assistant",
    version="1.0.0",
    docs_url="/docs" if ENV == "dev" else None,
    redoc_url=None,
    openapi_url="/openapi.json" if ENV == "dev" else None,
)

# Restrict CORS to explicitly configured origins (never "*" for a privileged API).
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
    allow_credentials=False,
)

# Public paths that do not require the API token.
_PUBLIC_PATHS = {"/", "/api/health"}


@app.middleware("http")
async def _security_gate(request: Request, call_next):
    path = request.url.path
    is_public = (
        request.method == "OPTIONS"
        or path in _PUBLIC_PATHS
        or path.startswith("/static")
        or (ENV == "dev" and path in ("/docs", "/openapi.json"))
    )
    if not is_public and path.startswith("/api/"):
        token = request.headers.get("x-api-key", "")
        if not APP_API_TOKEN or not secrets.compare_digest(token, APP_API_TOKEN):
            return JSONResponse({"detail": "unauthorized"}, status_code=401)
    response = await call_next(request)
    # Defense-in-depth security headers on every response.
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; "
        "script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'",
    )
    return response

BASE   = Path(__file__).parent.parent
STATIC = BASE / "static"
DOCS   = STATIC / "docs"
DOCS.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")

claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
MODEL  = "claude-opus-4-7"


def _safe_eval(expr: str) -> float:
    """Evaluate a pure arithmetic expression without eval() (CWE-94 safe).

    Only numeric literals and +, -, *, /, //, %, ** and unary +/- are allowed.
    Any function call, name lookup, or attribute access raises ValueError.
    """
    _BIN = {
        ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
        ast.Div: operator.truediv, ast.FloorDiv: operator.floordiv,
        ast.Mod: operator.mod, ast.Pow: operator.pow,
    }
    _UNARY = {ast.UAdd: operator.pos, ast.USub: operator.neg}

    def _ev(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in _BIN:
            return _BIN[type(node.op)](_ev(node.left), _ev(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY:
            return _UNARY[type(node.op)](_ev(node.operand))
        raise ValueError("expresión no permitida")

    return _ev(ast.parse(expr, mode="eval").body)


# ── Pydantic models ───────────────────────────────────────────────────────────
class VoiceCmd(BaseModel):
    transcript: str

class EmailSend(BaseModel):
    to: str
    subject: str
    body: str

class MsgSend(BaseModel):
    message: str

class DocRequest(BaseModel):
    doc_type: str          # "presentation" | "report"
    title: str
    brief: str
    slides: int = 6

class ChatMsg(BaseModel):
    message: str

class NLMNotebook(BaseModel):
    title: str

class NLMSource(BaseModel):
    notebook_id: str
    source_type: str   # "url" | "text" | "youtube"
    content: str
    label: str = ""

class NLMChat(BaseModel):
    notebook_id: str
    question: str

class NLMGenerate(BaseModel):
    notebook_id: str
    artifact_type: str  # "audio" | "quiz" | "flashcards" | "mindmap"

class VideoRequest(BaseModel):
    composition: str = "Presentation"   # Presentation | Intro | TextVideo | SocialReel
    title: str = ""
    slides: list = []
    text: str = ""
    author: str = "AI Assistant"
    accent_color: str = "#7c3aed"
    # SocialReel fields
    hook: str = ""
    subtext: str = ""
    points: list = []
    cta: str = "Sígueme"
    handle: str = ""
    color: str = "purple"


# ── Helpers ───────────────────────────────────────────────────────────────────
def _imap():
    m = imaplib.IMAP4_SSL("imap.gmail.com")
    m.login(os.getenv("GMAIL_USER", ""), os.getenv("GMAIL_APP_PASSWORD", ""))
    return m

def _decode(value: str) -> str:
    if not value:
        return ""
    parts = decode_header(value)
    out = []
    for part, enc in parts:
        if isinstance(part, bytes):
            out.append(part.decode(enc or "utf-8", errors="replace"))
        else:
            out.append(str(part))
    return " ".join(out)

def _body(msg) -> str:
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain" and not part.get("Content-Disposition"):
                raw = part.get_payload(decode=True)
                if raw:
                    return raw.decode(part.get_content_charset() or "utf-8", errors="replace")[:300]
    raw = msg.get_payload(decode=True)
    if raw:
        return raw.decode(msg.get_content_charset() or "utf-8", errors="replace")[:300]
    return ""

def _claude_json(prompt: str, system: str, max_tokens: int = 2048) -> dict:
    resp = claude.messages.create(
        model=MODEL, max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": prompt}]
    )
    text = resp.content[0].text.strip()
    # Strip markdown fences
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text.strip())
    except Exception:
        return {"raw": text}


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return FileResponse(str(STATIC / "index.html"))


# ── VOICE COMMAND ─────────────────────────────────────────────────────────────
VOICE_SYS = """Eres el cerebro de un asistente personal móvil. El usuario habla en español.
Interpreta la orden y responde SOLO con JSON válido (sin markdown):
{
  "intent": "...",
  "params": {},
  "reply": "texto corto para leer en voz alta al usuario"
}

Intents disponibles:
- open_social   → params: {app: "facebook"|"instagram"|"tiktok"|"youtube"}
- calculator    → params: {expression: "..."}   (si pide calcular algo)
- open_screen      → params: {screen: "email"|"messages"|"documents"|"chat"|"calculator"|"notebooklm"}
- read_emails      → params: {limit: 5}
- send_email       → params: {to: "...", subject: "...", body: "..."}
- send_whatsapp    → params: {message: "..."}
- create_doc       → params: {doc_type: "presentation"|"report", title: "...", brief: "...", slides: 6}
- ask_ai           → params: {question: "..."}
- nlm_create       → params: {title: "..."}
- nlm_add_source   → params: {notebook_id: "...", source_type: "url"|"text"|"youtube", content: "..."}
- nlm_chat         → params: {notebook_id: "...", question: "..."}
- unknown          → params: {}

Para cálculos matemáticos usa Python eval-safe expressions (sin imports).
Responde SOLO con JSON."""

@app.post("/api/voice")
async def voice(cmd: VoiceCmd):
    result = _claude_json(cmd.transcript, VOICE_SYS, max_tokens=512)
    intent = result.get("intent", "unknown")
    params = result.get("params", {})

    # Server-side executions
    if intent == "read_emails":
        result["data"] = _fetch_emails(params.get("limit", 5))

    elif intent == "send_email":
        try:
            _send_email(params.get("to",""), params.get("subject",""), params.get("body",""))
        except Exception:
            logger.exception("voice send_email failed")
            result["reply"] = "No pude enviar el correo."

    elif intent == "send_whatsapp":
        try:
            _whatsapp(params.get("message",""))
        except Exception:
            logger.exception("voice send_whatsapp failed")
            result["reply"] = "No pude enviar el mensaje de WhatsApp."

    elif intent == "create_doc":
        try:
            url = _make_doc(params)
            result["data"] = {"url": url}
        except Exception:
            logger.exception("voice create_doc failed")
            result["reply"] = "No pude crear el documento."

    elif intent == "calculator":
        try:
            val = _safe_eval(params.get("expression", "0"))
            result["data"] = {"result": val}
            result["reply"] = f"El resultado es {val}"
        except Exception:
            result["reply"] = "No pude calcular esa expresión."

    elif intent == "ask_ai":
        resp = claude.messages.create(
            model=MODEL, max_tokens=1024,
            messages=[{"role": "user", "content": params.get("question", cmd.transcript)}]
        )
        result["reply"] = resp.content[0].text.strip()

    elif intent == "nlm_create":
        try:
            from notebooklm import NotebookLMClient
            async def _create():
                async with await NotebookLMClient.from_storage() as c:
                    nb = await c.notebooks.create(params.get("title", "Nuevo cuaderno"))
                    return nb
            nb = asyncio.run(_create())
            result["data"] = {"id": nb.id, "title": nb.title}
            result["reply"] = f"Cuaderno '{nb.title}' creado en NotebookLM"
        except Exception:
            logger.exception("voice nlm_create failed")
            result["reply"] = "No pude crear el cuaderno en NotebookLM."

    elif intent in ("nlm_add_source", "nlm_chat"):
        result["reply"] = "Abre la pantalla de NotebookLM para continuar"
        result["params"]["screen"] = "notebooklm"

    return result


# ── EMAIL ─────────────────────────────────────────────────────────────────────
def _fetch_emails(limit: int = 10) -> list:
    try:
        mail = _imap()
        mail.select("INBOX")
        _, data = mail.search(None, "ALL")
        ids = data[0].split()[-limit:]
        out = []
        for num in reversed(ids):
            _, md = mail.fetch(num, "(RFC822)")
            msg = email_lib.message_from_bytes(md[0][1])
            out.append({
                "id": num.decode(),
                "from": _decode(msg.get("From", "")),
                "subject": _decode(msg.get("Subject", "(sin asunto)")),
                "date": msg.get("Date", ""),
                "preview": _body(msg).strip()[:180]
            })
        mail.logout()
        return out
    except Exception:
        logger.exception("fetch emails failed")
        return [{"error": "No se pudo acceder al correo."}]

@app.get("/api/email")
async def get_emails(limit: int = 10):
    return _fetch_emails(limit)

def _send_email(to: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg["From"]    = os.getenv("GMAIL_USER", "")
    msg["To"]      = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
        s.login(os.getenv("GMAIL_USER",""), os.getenv("GMAIL_APP_PASSWORD",""))
        s.send_message(msg)

@app.post("/api/email/send")
async def send_email(data: EmailSend):
    try:
        _send_email(data.to, data.subject, data.body)
        return {"ok": True}
    except Exception:
        logger.exception("send_email failed")
        raise HTTPException(500, "No se pudo enviar el correo.")


# ── WHATSAPP ──────────────────────────────────────────────────────────────────
def _whatsapp(message: str):
    r = requests.get("https://api.callmebot.com/whatsapp.php", params={
        "phone": os.getenv("CALLMEBOT_PHONE",""),
        "text": message,
        "apikey": os.getenv("CALLMEBOT_APIKEY","")
    }, timeout=15)
    if r.status_code != 200:
        # Log the status code only — never the response body (may echo the API key / message).
        logger.error("CallMeBot returned HTTP %s", r.status_code)
        raise Exception(f"CallMeBot HTTP {r.status_code}")

@app.post("/api/message")
async def send_message(data: MsgSend):
    try:
        _whatsapp(data.message)
        return {"ok": True}
    except Exception:
        logger.exception("send_message failed")
        raise HTTPException(500, "No se pudo enviar el mensaje.")


# ── DOCUMENTS ─────────────────────────────────────────────────────────────────
DOC_SYS = """Genera contenido estructurado en JSON para el documento solicitado.
Para presentación: {"slides": [{"title":"...","points":["...","..."]}]}
Para informe:      {"sections": [{"title":"...","content":"..."}]}
Responde SOLO con JSON válido, sin markdown, en español."""

def _make_doc(params: dict) -> str:
    doc_type = params.get("doc_type", "report")
    title    = params.get("title", "Documento")
    brief    = params.get("brief", title)
    slides   = int(params.get("slides", 6))

    prompt = (f"Crea {'una presentación de ' + str(slides) + ' diapositivas' if doc_type == 'presentation' else 'un informe detallado'} "
              f"sobre: {brief}. Título: {title}")

    data   = _claude_json(prompt, DOC_SYS, max_tokens=2048)
    # Unguessable filename (~128 bits) — served via public /static, so the name is the only guard.
    fname  = f"{secrets.token_urlsafe(16)}.{'pptx' if doc_type == 'presentation' else 'docx'}"
    fpath  = DOCS / fname

    if doc_type == "presentation":
        _build_pptx(fpath, title, data)
    else:
        _build_docx(fpath, title, data)

    return f"/static/docs/{fname}"

def _build_pptx(fpath: Path, title: str, data: dict):
    try:
        from pptx import Presentation
        from pptx.util import Pt
    except ImportError:
        fpath = fpath.with_suffix(".txt")
        fpath.write_text(f"PRESENTACIÓN: {title}\n\n" +
            "\n".join(f"--- {s['title']} ---\n" + "\n".join(f"• {p}" for p in s.get("points",[])) for s in data.get("slides",[])))
        return

    prs = Presentation()
    # Title slide
    sl  = prs.slides.add_slide(prs.slide_layouts[0])
    sl.shapes.title.text = title
    if len(sl.placeholders) > 1:
        sl.placeholders[1].text = datetime.now().strftime("%d/%m/%Y")

    for s in data.get("slides", []):
        sl  = prs.slides.add_slide(prs.slide_layouts[1])
        sl.shapes.title.text = s.get("title", "")
        if len(sl.placeholders) > 1:
            tf = sl.placeholders[1].text_frame
            tf.clear()
            for point in s.get("points", []):
                p = tf.add_paragraph()
                p.text = f"• {point}"
    prs.save(str(fpath))

def _build_docx(fpath: Path, title: str, data: dict):
    try:
        from docx import Document
    except ImportError:
        fpath = fpath.with_suffix(".txt")
        fpath.write_text(f"INFORME: {title}\n\n" +
            "\n".join(f"## {s['title']}\n{s.get('content','')}" for s in data.get("sections",[])))
        return

    doc = Document()
    doc.add_heading(title, 0)
    doc.add_paragraph(f"Fecha: {datetime.now().strftime('%d de %B de %Y')}")
    doc.add_paragraph("")
    for sec in data.get("sections", []):
        doc.add_heading(sec.get("title", ""), 1)
        doc.add_paragraph(sec.get("content", ""))
    doc.save(str(fpath))

@app.post("/api/document")
async def create_doc(data: DocRequest):
    try:
        url = _make_doc({"doc_type": data.doc_type, "title": data.title,
                         "brief": data.brief, "slides": data.slides})
        return {"url": url}
    except Exception:
        logger.exception("create_doc failed")
        raise HTTPException(500, "No se pudo crear el documento.")


# ── AI CHAT ───────────────────────────────────────────────────────────────────
@app.post("/api/chat")
async def chat(data: ChatMsg):
    resp = claude.messages.create(
        model=MODEL, max_tokens=1024,
        messages=[{"role": "user", "content": data.message}]
    )
    return {"reply": resp.content[0].text.strip()}


# ── VIDEO (Remotion) ──────────────────────────────────────────────────────────
VIDEO_DIR = BASE / "static" / "videos"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)
REMOTION_ROOT = BASE / "video" / "src" / "index.jsx"

@app.post("/api/video")
async def create_video(data: VideoRequest):
    import subprocess, shutil
    node = shutil.which("node") or "node"
    npx  = shutil.which("npx")  or "npx"

    fname  = f"{secrets.token_urlsafe(16)}.mp4"
    output = VIDEO_DIR / fname

    # Build inputProps JSON for Remotion
    props: dict = {}
    if data.composition == "Presentation":
        props = {
            "title": data.title or "Presentación",
            "slides": data.slides or [{"title": "Slide 1", "points": ["Punto principal"]}],
            "accentColor": data.accent_color,
        }
    elif data.composition == "TextVideo":
        props = {"text": data.text, "author": data.author}
    elif data.composition == "SocialReel":
        props = {
            "hook": data.hook or data.title or "¿Sabías esto?",
            "subtext": data.subtext or data.text or "",
            "points": data.points or data.slides or [],
            "cta": data.cta, "handle": data.handle, "color": data.color,
        }
    else:
        props = {"title": data.title or "AI Assistant", "subtitle": data.text or ""}

    cmd = [
        npx, "remotion", "render",
        str(REMOTION_ROOT),
        data.composition,
        str(output),
        "--props", json.dumps(props),
        "--log", "error",
    ]
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(BASE / "video"),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await asyncio.wait_for(proc.communicate(), timeout=300)
        if proc.returncode != 0:
            logger.error("Remotion render failed: %s", stderr.decode()[-400:])
            raise HTTPException(500, "No se pudo renderizar el video.")
        return {"url": f"/static/videos/{fname}"}
    except asyncio.TimeoutError:
        raise HTTPException(504, "Video rendering timed out (>5 min)")


# ── NOTEBOOKLM ────────────────────────────────────────────────────────────────
def _validate_public_url(raw: str) -> str:
    """Reject non-http(s) schemes and private/link-local hosts (CWE-918 SSRF guard)."""
    import ipaddress, socket
    from urllib.parse import urlparse

    parsed = urlparse(raw)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise HTTPException(400, "URL no válida.")
    host = parsed.hostname
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        raise HTTPException(400, "No se pudo resolver el host de la URL.")
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            raise HTTPException(400, "URL apunta a una dirección interna no permitida.")
    return raw


def _nlm_client():
    """Return an authenticated NotebookLMClient or raise a clear error."""
    try:
        from notebooklm import NotebookLMClient
        return NotebookLMClient
    except ImportError:
        raise HTTPException(503, "notebooklm-py no instalado. Ejecuta: pip install 'notebooklm-py[browser]'")

@app.get("/api/notebooklm/notebooks")
async def nlm_list():
    Client = _nlm_client()
    try:
        async with await Client.from_storage() as c:
            nbs = await c.notebooks.list()
            return [{"id": n.id, "title": n.title} for n in nbs]
    except HTTPException:
        raise
    except Exception:
        logger.exception("notebooklm operation failed")
        raise HTTPException(500, "Error en la operación de NotebookLM.")

@app.post("/api/notebooklm/notebook")
async def nlm_create(data: NLMNotebook):
    Client = _nlm_client()
    try:
        async with await Client.from_storage() as c:
            nb = await c.notebooks.create(data.title)
            return {"id": nb.id, "title": nb.title}
    except HTTPException:
        raise
    except Exception:
        logger.exception("notebooklm operation failed")
        raise HTTPException(500, "Error en la operación de NotebookLM.")

@app.post("/api/notebooklm/source")
async def nlm_add_source(data: NLMSource):
    Client = _nlm_client()
    try:
        async with await Client.from_storage() as c:
            if data.source_type == "url":
                src = await c.sources.add_url(data.notebook_id, _validate_public_url(data.content))
            elif data.source_type == "youtube":
                src = await c.sources.add_youtube(data.notebook_id, _validate_public_url(data.content))
            else:
                src = await c.sources.add_text(data.notebook_id, data.content,
                                                title=data.label or "Fuente")
            return {"ok": True, "source_id": getattr(src, "id", None)}
    except HTTPException:
        raise
    except Exception:
        logger.exception("notebooklm operation failed")
        raise HTTPException(500, "Error en la operación de NotebookLM.")

@app.post("/api/notebooklm/chat")
async def nlm_chat(data: NLMChat):
    Client = _nlm_client()
    try:
        async with await Client.from_storage() as c:
            result = await c.chat.ask(data.notebook_id, data.question)
            return {
                "answer": result.answer,
                "citations": getattr(result, "citations", []),
            }
    except HTTPException:
        raise
    except Exception:
        logger.exception("notebooklm operation failed")
        raise HTTPException(500, "Error en la operación de NotebookLM.")

@app.post("/api/notebooklm/generate")
async def nlm_generate(data: NLMGenerate):
    Client = _nlm_client()
    try:
        async with await Client.from_storage() as c:
            art = data.artifact_type
            if art == "audio":
                artifact = await c.artifacts.generate_audio(data.notebook_id)
            elif art == "quiz":
                artifact = await c.artifacts.generate_quiz(data.notebook_id)
            elif art == "flashcards":
                artifact = await c.artifacts.generate_flashcards(data.notebook_id)
            else:
                artifact = await c.artifacts.generate_report(data.notebook_id)
            completed = await c.artifacts.wait_for_completion(artifact)
            return {"ok": True, "artifact_type": art,
                    "content": getattr(completed, "content", None),
                    "url": getattr(completed, "url", None)}
    except HTTPException:
        raise
    except Exception:
        logger.exception("notebooklm operation failed")
        raise HTTPException(500, "Error en la operación de NotebookLM.")


# ── HEALTH ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "time": datetime.now().isoformat()}
