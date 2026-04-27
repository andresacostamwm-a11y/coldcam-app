import imaplib
import email
import os
import json
import time
import schedule
import requests
from email.header import decode_header
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
CALLMEBOT_PHONE = os.getenv("CALLMEBOT_PHONE")
CALLMEBOT_APIKEY = os.getenv("CALLMEBOT_APIKEY")

SENDERS = [
    "esden",
    "hybridge",
    "salamanca",
    "goinglobal",
    "monterrey",
    "bigschool",
    "espaciobim",
    "espacio bim",
]

SEEN_FILE = "seen_emails.json"


def load_seen():
    if os.path.exists(SEEN_FILE):
        with open(SEEN_FILE) as f:
            return set(json.load(f))
    return set()


def save_seen(seen: set):
    with open(SEEN_FILE, "w") as f:
        json.dump(list(seen), f)


def decode_str(value):
    if not value:
        return ""
    parts = decode_header(value)
    result = []
    for part, encoding in parts:
        if isinstance(part, bytes):
            result.append(part.decode(encoding or "utf-8", errors="replace"))
        else:
            result.append(part)
    return " ".join(result)


def get_body(msg):
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain" and not part.get("Content-Disposition"):
                payload = part.get_payload(decode=True)
                if payload:
                    body = payload.decode(part.get_content_charset() or "utf-8", errors="replace")
                    break
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            body = payload.decode(msg.get_content_charset() or "utf-8", errors="replace")
    return body.strip()


def is_target_sender(from_field: str) -> bool:
    from_lower = from_field.lower()
    return any(s in from_lower for s in SENDERS)


def send_whatsapp(message: str):
    url = "https://api.callmebot.com/whatsapp.php"
    params = {
        "phone": CALLMEBOT_PHONE,
        "text": message,
        "apikey": CALLMEBOT_APIKEY,
    }
    try:
        r = requests.get(url, params=params, timeout=15)
        if r.status_code == 200:
            print(f"[OK] WhatsApp enviado")
        else:
            print(f"[ERROR] CallMeBot: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"[ERROR] WhatsApp: {e}")


def check_emails():
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Revisando correos...")
    seen = load_seen()

    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        mail.select("INBOX")

        since = (datetime.now() - timedelta(hours=3)).strftime("%d-%b-%Y")
        _, data = mail.search(None, f'(SINCE "{since}")')

        ids = data[0].split()
        print(f"  Correos en las últimas 3h: {len(ids)}")

        for num in ids:
            uid = num.decode()
            if uid in seen:
                continue

            _, msg_data = mail.fetch(num, "(RFC822)")
            raw = msg_data[0][1]
            msg = email.message_from_bytes(raw)

            from_field = decode_str(msg.get("From", ""))
            subject = decode_str(msg.get("Subject", "(sin asunto)"))

            if not is_target_sender(from_field):
                continue

            body = get_body(msg)
            preview = body[:300].replace("\n", " ").strip()
            if len(body) > 300:
                preview += "..."

            message = (
                f"📧 *Nuevo correo*\n"
                f"*De:* {from_field}\n"
                f"*Asunto:* {subject}\n"
                f"*Contenido:*\n{preview}"
            )

            print(f"  → Enviando: {subject[:50]} | De: {from_field[:40]}")
            send_whatsapp(message)
            seen.add(uid)
            time.sleep(2)

        save_seen(seen)
        mail.logout()

    except imaplib.IMAP4.error as e:
        print(f"[ERROR] IMAP: {e}")
    except Exception as e:
        print(f"[ERROR] General: {e}")


if __name__ == "__main__":
    print("=== Monitor de correos → WhatsApp ===")
    print(f"Cuenta: {GMAIL_USER}")
    print(f"WhatsApp destino: {CALLMEBOT_PHONE}")
    print(f"Remitentes monitoreados: ESDEN, Hybridge, U. Salamanca, Tec de Monterrey, Bigschool, Espacio BIM")
    print(f"Frecuencia: cada 3 horas\n")

    check_emails()

    schedule.every(3).hours.do(check_emails)

    while True:
        schedule.run_pending()
        time.sleep(60)
