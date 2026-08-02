#!/usr/bin/env python3
"""Recordatorios con hora para el modo TDAH.

Almacena avisos en SQLite y los saca por pantalla cuando vencen, vía hook
UserPromptSubmit. Sin dependencias externas: solo biblioteca estándar.

Adaptado de ravila4/claude-adhd-skills (MIT).

Uso:
    recordatorios.py add "23:00" "el usuario pidió parar a las 11 - proponer cierre"
    recordatorios.py add "+45m" "sesión larga - sugerir descanso"
    recordatorios.py check          # los vencidos (lo que ejecuta el hook)
    recordatorios.py list           # todos los pendientes
    recordatorios.py ack 3          # marcar como atendido
"""

import argparse
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path

def _raiz_proyecto() -> Path:
    """Sube hasta el directorio que contiene .claude/ (la raíz del proyecto).

    Se usa resolve() para que la ruta sea la misma tanto si el script se invoca
    por .agents/skills/... como por el symlink en .claude/skills/...
    """
    aqui = Path(__file__).resolve()
    for candidato in aqui.parents:
        if (candidato / ".claude").is_dir():
            return candidato
    return aqui.parents[4]


# La BD vive junto a la config del proyecto, no dentro de la skill, para que
# sobreviva a una reinstalación de las skills.
DB_PATH = _raiz_proyecto() / ".claude" / "recordatorios.db"

FORMATO = "%Y-%m-%d %H:%M"


def conectar() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS recordatorios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vence_en TEXT NOT NULL,
            mensaje TEXT NOT NULL,
            creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            atendido INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    return conn


def parsear_hora(texto: str) -> str:
    """Convierte la hora pedida a 'YYYY-MM-DD HH:MM' en hora local.

    Acepta: 'HH:MM' (hoy, o mañana si ya pasó), 'YYYY-MM-DD HH:MM',
    '+30m', '+2h'.
    """
    ahora = datetime.now()

    if texto.startswith("+"):
        cuerpo, unidad = texto[1:-1], texto[-1]
        try:
            cantidad = int(cuerpo)
        except ValueError:
            raise ValueError(f"Formato inválido: {texto!r}. Se esperaba +30m o +2h")
        if cantidad <= 0:
            raise ValueError(f"El desplazamiento debe ser positivo: {texto!r}")
        if unidad == "m":
            objetivo = ahora + timedelta(minutes=cantidad)
        elif unidad == "h":
            objetivo = ahora + timedelta(hours=cantidad)
        else:
            raise ValueError(f"Unidad desconocida: {unidad!r}. Usa 'm' o 'h'")
        return objetivo.strftime(FORMATO)

    if len(texto) == 5 and texto[2] == ":":
        try:
            hora, minuto = int(texto[:2]), int(texto[3:])
            objetivo = ahora.replace(hour=hora, minute=minuto, second=0, microsecond=0)
        except ValueError:
            raise ValueError(f"Hora inválida: {texto!r}. Se esperaba HH:MM entre 00:00 y 23:59")
        # Mejora sobre el original: si la hora ya pasó hoy, se asume mañana en
        # lugar de crear un recordatorio que vence de inmediato.
        if objetivo <= ahora:
            objetivo += timedelta(days=1)
        return objetivo.strftime(FORMATO)

    try:
        return datetime.strptime(texto, FORMATO).strftime(FORMATO)
    except ValueError:
        raise ValueError(
            f"No entiendo la hora {texto!r}. Usa HH:MM, 'YYYY-MM-DD HH:MM', +30m o +2h"
        )


def cmd_add(args: argparse.Namespace) -> int:
    try:
        vence = parsear_hora(args.hora)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    with conectar() as conn:
        cur = conn.execute(
            "INSERT INTO recordatorios (vence_en, mensaje) VALUES (?, ?)",
            (vence, args.mensaje),
        )
    print(f"[{cur.lastrowid}] recordatorio para {vence}: {args.mensaje}")
    return 0


def cmd_check(_: argparse.Namespace) -> int:
    ahora = datetime.now().strftime(FORMATO)
    with conectar() as conn:
        filas = conn.execute(
            "SELECT id, vence_en, mensaje FROM recordatorios "
            "WHERE vence_en <= ? AND atendido = 0 ORDER BY vence_en",
            (ahora,),
        ).fetchall()
    if not filas:
        return 0
    print("RECORDATORIOS VENCIDOS:")
    for rid, vence, mensaje in filas:
        print(f"  [{rid}] {vence}: {mensaje}")
    print("(atiéndelos y luego: recordatorios.py ack <id>)")
    return 0


def cmd_list(_: argparse.Namespace) -> int:
    with conectar() as conn:
        filas = conn.execute(
            "SELECT id, vence_en, mensaje FROM recordatorios "
            "WHERE atendido = 0 ORDER BY vence_en"
        ).fetchall()
    if not filas:
        print("Sin recordatorios pendientes.")
        return 0
    for rid, vence, mensaje in filas:
        print(f"[{rid}] {vence}: {mensaje}")
    return 0


def cmd_ack(args: argparse.Namespace) -> int:
    with conectar() as conn:
        cur = conn.execute(
            "UPDATE recordatorios SET atendido = 1 WHERE id = ? AND atendido = 0",
            (args.id,),
        )
    if cur.rowcount == 0:
        print(f"error: no hay recordatorio pendiente con id {args.id}", file=sys.stderr)
        return 1
    print(f"[{args.id}] atendido")
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = p.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("add", help="crear un recordatorio")
    a.add_argument("hora", help="HH:MM, 'YYYY-MM-DD HH:MM', +30m o +2h")
    a.add_argument("mensaje", help="motivo - acción a tomar")
    a.set_defaults(func=cmd_add)

    c = sub.add_parser("check", help="mostrar los vencidos (usado por el hook)")
    c.set_defaults(func=cmd_check)

    l = sub.add_parser("list", help="listar todos los pendientes")
    l.set_defaults(func=cmd_list)

    k = sub.add_parser("ack", help="marcar como atendido")
    k.add_argument("id", type=int)
    k.set_defaults(func=cmd_ack)

    args = p.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
