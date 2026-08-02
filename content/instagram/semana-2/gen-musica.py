#!/usr/bin/env python3
"""Pista musical original de la marca — v2 "VIRAL 2026".

Estilo: reggaetón / dembow moderno con 808 deslizante, plucks oscuros y
stabs tipo vocal-chop. Es el sonido que domina el contenido viral latino
de 2026, adaptado a la paleta premium de "Andres Acosta Vertex AI
Engineering" (azul marino + dorado + cian).

100 % original y libre de derechos.
Salida: brand-track.wav  (~48 s, 44.1 kHz estéreo, 96 BPM)
"""
import numpy as np
import wave

SR = 44100
BPM = 96.0
BEAT = 60.0 / BPM           # 0.625 s
STEP = BEAT / 4             # semicorchea
BAR = 4 * BEAT              # 2.5 s
BARS = 19                   # ~47.5 s
TOTAL = BARS * BAR

n = int(TOTAL * SR)
mix = np.zeros(n, dtype=np.float64)


def add(sig, t):
    i = int(t * SR)
    j = min(i + len(sig), n)
    if i < n:
        mix[i:j] += sig[: j - i]


# ---------------------------------------------------------------- batería
def kick(t0, amp=0.9):
    """Kick corto y punchy, típico de dembow."""
    dur = 0.28
    L = int(dur * SR)
    t = np.arange(L) / SR
    f = 48 + 90 * np.exp(-t * 34)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) * amp
    s += np.random.uniform(-1, 1, L) * np.exp(-t * 420) * 0.16  # click
    add(s, t0)


def snare(t0, amp=0.42):
    """Caja/rim con cuerpo — la 'ch' del dembow."""
    dur = 0.19
    L = int(dur * SR)
    t = np.arange(L) / SR
    noise = np.diff(np.random.uniform(-1, 1, L), prepend=0.0)
    tone = np.sin(2 * np.pi * 190 * t) * 0.5
    s = (noise * 0.85 + tone) * np.exp(-t * 26) * amp
    add(s, t0)


def hat(t0, amp=0.075, open_=False):
    dur = 0.14 if open_ else 0.045
    L = int(dur * SR)
    s = np.diff(np.random.uniform(-1, 1, L), prepend=0.0)
    decay = 22 if open_ else 105
    s *= np.exp(-np.arange(L) / SR * decay) * amp
    add(s, t0)


# ------------------------------------------------------------------- 808
def sub808(t0, freq, dur, amp=0.62, glide_from=None):
    """808 con saturación y glide opcional (marca registrada del género)."""
    L = int(dur * SR)
    t = np.arange(L) / SR
    if glide_from:
        g = np.exp(-t * 22)
        f = freq + (glide_from - freq) * g
    else:
        f = np.full(L, freq)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s = np.tanh(s * 2.1) * 0.75          # saturación -> armónicos audibles
    e = np.exp(-t * 1.5)
    e[: int(0.006 * SR)] *= np.linspace(0, 1, int(0.006 * SR))
    r = int(0.05 * SR)
    e[-r:] *= np.linspace(1, 0, r)
    add(s * e * amp, t0)


# ------------------------------------------------------- sintes melódicos
def pluck(t0, freq, dur, amp=0.15):
    """Pluck oscuro tipo marimba/synth — el gancho melódico."""
    L = int(dur * SR)
    t = np.arange(L) / SR
    s = (np.sin(2 * np.pi * freq * t)
         + 0.42 * np.sin(2 * np.pi * freq * 2 * t)
         + 0.20 * np.sin(2 * np.pi * freq * 3 * t))
    s *= np.exp(-t * 9.5)
    s[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    add(s * amp, t0)


def stab(t0, freqs, dur, amp=0.10):
    """Stab de acorde tipo vocal-chop (filtrado y corto)."""
    L = int(dur * SR)
    t = np.arange(L) / SR
    s = np.zeros(L)
    for f in freqs:
        s += 2 * (t * f - np.floor(0.5 + t * f))       # saw
    s /= len(freqs)
    # vibrato leve = sensación de voz
    s *= 1 + 0.05 * np.sin(2 * np.pi * 5.5 * t)
    e = np.exp(-t * 7)
    e[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    add(s * e * amp, t0)


def pad(t0, freqs, dur, amp=0.045):
    L = int(dur * SR)
    t = np.arange(L) / SR
    s = np.zeros(L)
    for f in freqs:
        s += 2 * (t * f - np.floor(0.5 + t * f))
        s += 2 * (t * f * 1.006 - np.floor(0.5 + t * f * 1.006))
    s /= 2 * len(freqs)
    a, r = int(0.35 * SR), int(0.6 * SR)
    e = np.ones(L)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r)
    add(s * e * amp, t0)


# ------------------------------------------------------------------ notas
N = {"A1": 55.00, "F1": 43.65, "D1": 36.71, "E1": 41.20,
     "A2": 110.00, "C3": 130.81, "D3": 146.83, "E3": 164.81,
     "F3": 174.61, "G3": 196.00, "A3": 220.00, "C4": 261.63,
     "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00,
     "A4": 440.00, "C5": 523.25, "E5": 659.25}

# Am - F - C - G  (progresión con gancho, muy usada en viral latino)
PROG = [("A1", ["A3", "C4", "E4"], ["A4", "E4", "C5", "E4"]),
        ("F1", ["F3", "A3", "C4"], ["F4", "C5", "A4", "C5"]),
        ("C3", ["C4", "E4", "G4"], ["G4", "E5", "C5", "E5"]),
        ("G3", ["G3", "D4", "G4"], ["D4", "G4", "E4", "G4"])]

# --- DEMBOW: el patrón que define el género (16 semicorcheas por compás)
KICK_STEPS = [0, 3, 8, 11]
SNARE_STEPS = [4, 7, 12, 15]

for bar in range(BARS):
    t0 = bar * BAR
    root, chord, melody = PROG[bar % 4]
    intro = bar < 2
    drop = 4 <= bar < 12          # sección más potente
    outro = bar >= BARS - 2

    # Pad de fondo siempre
    pad(t0, chord, BAR, amp=0.05 if not intro else 0.065)

    # Batería dembow
    if not intro:
        for s in KICK_STEPS:
            kick(t0 + s * STEP, amp=0.92 if drop else 0.78)
        for s in SNARE_STEPS:
            snare(t0 + s * STEP, amp=0.44 if drop else 0.34)
    for k in range(8):
        hat(t0 + k * BEAT / 2, amp=0.085 if k % 2 == 0 else 0.055,
            open_=(k == 7))

    # 808: raíz con glide desde la nota anterior
    if not intro:
        prev = PROG[(bar - 1) % 4][0]
        sub808(t0, N[root], BEAT * 1.9, amp=0.60,
               glide_from=N[prev] if bar > 0 else None)
        sub808(t0 + 2 * BEAT, N[root], BEAT * 1.6, amp=0.52)

    # Plucks: el gancho melódico
    if not intro and not outro:
        for k, name in enumerate(melody):
            pluck(t0 + k * BEAT, N[name], BEAT * 0.9,
                  amp=0.17 if drop else 0.13)
        # contratiempo brillante
        if drop:
            pluck(t0 + 3.5 * BEAT, N[melody[0]] * 2, BEAT * 0.4, amp=0.075)

    # Stabs tipo vocal-chop en el drop
    if drop:
        stab(t0 + 2 * BEAT, [N[f] for f in chord], BEAT * 0.7, amp=0.095)

# ------------------------------------------------------------------ master
mix = np.tanh(mix * 1.08)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.91

fi, fo = int(0.35 * SR), int(1.5 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)

left = mix
right = np.concatenate([np.zeros(int(0.009 * SR)), mix])[:n]
pcm = (np.stack([left, right * 0.97], axis=1) * 32767).astype(np.int16)

with wave.open("brand-track.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())

print(f"brand-track.wav v2 VIRAL — {TOTAL:.1f}s, {BPM:.0f} BPM, dembow + 808")
