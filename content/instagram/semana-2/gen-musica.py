#!/usr/bin/env python3
"""Genera la pista musical original de la marca (100% libre de derechos).

Estilo: electrónica premium / synth oscuro, para acompañar los carruseles
de "Andres Acosta Vertex AI Engineering" (paleta azul marino + dorado + cian).

Salida: brand-track.wav  (~48 s, 44.1 kHz estéreo)
"""
import numpy as np
import wave

SR = 44100
BPM = 100.0
BEAT = 60.0 / BPM          # 0.6 s
BAR = 4 * BEAT             # 2.4 s
BARS = 20                  # 20 compases = 48 s
TOTAL = BARS * BAR

n = int(TOTAL * SR)
mix = np.zeros(n, dtype=np.float64)


def idx(t):
    return int(t * SR)


def add(sig, t):
    """Suma sig al mix comenzando en el segundo t."""
    i = idx(t)
    j = min(i + len(sig), n)
    if i < n:
        mix[i:j] += sig[: j - i]


def env(length, attack=0.005, decay=0.0, sustain=1.0, release=0.05):
    """Envolvente ADSR sencilla sobre un vector de 'length' muestras."""
    e = np.ones(length)
    a = int(attack * SR)
    r = int(release * SR)
    d = int(decay * SR)
    if a > 0:
        e[:a] = np.linspace(0, 1, a)
    if d > 0:
        e[a:a + d] = np.linspace(1, sustain, min(d, length - a))
        e[a + d:] = sustain
    if r > 0 and r < length:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def note(freq, dur, wave_type="saw", amp=0.2, detune=0.0, **kw):
    length = int(dur * SR)
    t = np.arange(length) / SR
    if wave_type == "saw":
        s = 2 * (t * freq - np.floor(0.5 + t * freq))
        if detune:
            f2 = freq * (1 + detune)
            s = s + 2 * (t * f2 - np.floor(0.5 + t * f2))
            s /= 2
    elif wave_type == "square":
        s = np.sign(np.sin(2 * np.pi * freq * t))
    else:  # sine
        s = np.sin(2 * np.pi * freq * t)
    return s * env(length, **kw) * amp


def kick(t0):
    dur = 0.32
    length = int(dur * SR)
    t = np.arange(length) / SR
    # barrido de tono 120 Hz -> 45 Hz
    f = 45 + 75 * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(phase) * np.exp(-t * 9) * 0.85
    add(s, t0)


def hat(t0, amp=0.09, dur=0.05):
    length = int(dur * SR)
    s = np.random.uniform(-1, 1, length)
    # filtro paso-alto barato: diferencia de primer orden
    s = np.diff(s, prepend=0.0)
    s *= np.exp(-np.arange(length) / SR * 90) * amp
    add(s, t0)


def clap(t0, amp=0.3):
    dur = 0.22
    length = int(dur * SR)
    s = np.random.uniform(-1, 1, length)
    s = np.diff(s, prepend=0.0)
    t = np.arange(length) / SR
    s *= np.exp(-t * 18) * amp
    add(s, t0)


# --- Notas (Hz) --------------------------------------------------------
N = {
    "A1": 55.00, "F1": 43.65, "C2": 65.41, "G1": 49.00,
    "A2": 110.00, "C3": 130.81, "E3": 164.81, "F3": 174.61,
    "G3": 196.00, "A3": 220.00, "C4": 261.63, "E4": 329.63,
    "F4": 349.23, "G4": 392.00, "A4": 440.00, "C5": 523.25, "E5": 659.25,
}

# Progresión Am - F - C - G (i - VI - III - VII), 4 compases
PROG = [
    ("A1", ["A3", "C4", "E4"]),
    ("F1", ["F3", "A3", "C4"]),
    ("C2", ["C4", "E4", "G4"]),
    ("G1", ["G3", "C4", "E4"]),
]
ARP = {0: ["A4", "C5", "E5", "C5"], 1: ["F4", "A4", "C5", "A4"],
       2: ["C5", "E5", "G4", "E5"], 3: ["G4", "C5", "E5", "C5"]}

for bar in range(BARS):
    t0 = bar * BAR
    root, chord = PROG[bar % 4]
    # intro más suave los 2 primeros compases, outro los 2 últimos
    intro = bar < 2
    outro = bar >= BARS - 2
    gain = 0.55 if (intro or outro) else 1.0

    # Pad de acordes (sostenido todo el compás)
    for f in chord:
        add(note(N[f], BAR, "saw", amp=0.055 * gain, detune=0.006,
                 attack=0.25, release=0.5), t0)

    # Bajo: raíz en negras 1 y 3, con octava en la 4
    if not intro:
        add(note(N[root], BEAT * 1.6, "saw", amp=0.30, attack=0.01,
                 release=0.12), t0)
        add(note(N[root], BEAT * 1.2, "saw", amp=0.26, attack=0.01,
                 release=0.12), t0 + 2 * BEAT)
        add(note(N[root] * 2, BEAT * 0.5, "saw", amp=0.18, attack=0.01,
                 release=0.08), t0 + 3.5 * BEAT)

    # Batería
    if not intro:
        for b in (0, 1, 2, 3):
            kick(t0 + b * BEAT)
        clap(t0 + 1 * BEAT, amp=0.26)
        clap(t0 + 3 * BEAT, amp=0.26)
    for k in range(8):  # hi-hats en corcheas
        hat(t0 + k * BEAT / 2, amp=0.075 if k % 2 else 0.11)

    # Arpegio brillante (el "toque tech")
    if not intro and not outro:
        seq = ARP[bar % 4]
        for k, name in enumerate(seq):
            add(note(N[name], BEAT * 0.45, "square", amp=0.055,
                     attack=0.004, release=0.10), t0 + k * BEAT)

# --- Master ------------------------------------------------------------
# Compresión suave + normalizado
mix = np.tanh(mix * 1.15)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89

# Fade in / out
fi, fo = int(0.6 * SR), int(1.6 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)

# Estéreo con leve ensanchado
left = mix
right = np.concatenate([np.zeros(int(0.008 * SR)), mix])[:n]
stereo = np.stack([left, right * 0.97], axis=1)
pcm = (stereo * 32767).astype(np.int16)

with wave.open("brand-track.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())

print(f"brand-track.wav listo — {TOTAL:.1f}s, {BPM:.0f} BPM, Am-F-C-G")
