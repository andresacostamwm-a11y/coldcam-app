"""AI Personal Assistant — FastAPI Backend"""
from __future__ import annotations
import os, json, imaplib, email as email_lib, smtplib, uuid
from email.header import decode_header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import anthropic
from dotenv import load_dotenv

load_dotenv()

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(title="AI Personal Assistant", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

BASE   = Path(__file__).parent.parent
STATIC = BASE / "static"
DOCS   = STATIC / "docs"
DOCS.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")

claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
MODEL  = "claude-opus-4-7"


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
- open_screen   → params: {screen: "email"|"messages"|"documents"|"chat"|"calculator"}
- read_emails   → params: {limit: 5}
- send_email    → params: {to: "...", subject: "...", body: "..."}
- send_whatsapp → params: {message: "..."}
- create_doc    → params: {doc_type: "presentation"|"report", title: "...", brief: "...", slides: 6}
- ask_ai        → params: {question: "..."}
- unknown       → params: {}

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
        except Exception as e:
            result["reply"] = f"Error al enviar: {e}"

    elif intent == "send_whatsapp":
        try:
            _whatsapp(params.get("message",""))
        except Exception as e:
            result["reply"] = f"Error WhatsApp: {e}"

    elif intent == "create_doc":
        try:
            url = _make_doc(params)
            result["data"] = {"url": url}
        except Exception as e:
            result["reply"] = f"Error creando documento: {e}"

    elif intent == "calculator":
        try:
            expr = params.get("expression","0")
            import math as _m
            safe = {"__builtins__": {}, "math": _m, **vars(_m)}
            val = eval(expr, safe)
            result["data"] = {"result": val}
            result["reply"] = f"El resultado es {val}"
        except Exception as e:
            result["reply"] = f"No pude calcular: {e}"

    elif intent == "ask_ai":
        resp = claude.messages.create(
            model=MODEL, max_tokens=1024,
            messages=[{"role": "user", "content": params.get("question", cmd.transcript)}]
        )
        result["reply"] = resp.content[0].text.strip()

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
    except Exception as e:
        return [{"error": str(e)}]

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
    except Exception as e:
        raise HTTPException(500, str(e))


# ── WHATSAPP ──────────────────────────────────────────────────────────────────
def _whatsapp(message: str):
    r = requests.get("https://api.callmebot.com/whatsapp.php", params={
        "phone": os.getenv("CALLMEBOT_PHONE",""),
        "text": message,
        "apikey": os.getenv("CALLMEBOT_APIKEY","")
    }, timeout=15)
    if r.status_code != 200:
        raise Exception(f"CallMeBot {r.status_code}: {r.text[:100]}")

@app.post("/api/message")
async def send_message(data: MsgSend):
    try:
        _whatsapp(data.message)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(500, str(e))


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
    fname  = f"{uuid.uuid4().hex[:8]}.{'pptx' if doc_type == 'presentation' else 'docx'}"
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
    except Exception as e:
        raise HTTPException(500, str(e))


# ── AI CHAT ───────────────────────────────────────────────────────────────────
@app.post("/api/chat")
async def chat(data: ChatMsg):
    resp = claude.messages.create(
        model=MODEL, max_tokens=1024,
        messages=[{"role": "user", "content": data.message}]
    )
    return {"reply": resp.content[0].text.strip()}


# ── HEALTH ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "time": datetime.now().isoformat()}
