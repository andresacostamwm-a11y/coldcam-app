# Trifecta Perfecta · The Architect + Cyber Neo + All Deploy

Tres herramientas open source (MIT) de [Hainrixz](https://github.com/Hainrixz) para Claude Code,
instaladas en este repo siguiendo la guía de
[tododeia.com/community/trifecta-perfecta](https://www.tododeia.com/community/trifecta-perfecta).
Se usan en orden: **diseñá → blindá → publicá**.

## 01 · The Architect — diseñá

Meta-agente que te entrevista en cuatro fases (Discovery → Deep Dive → Architecture → Generate)
y genera un `BLUEPRINT.md` con 16 secciones: stack, schema de base de datos, rutas, componentes y deploy target.

- Vive en [`tools/the-architect/`](../tools/the-architect/) — **no es una skill ni tiene slash command**.
- Se usa entrando a esa carpeta con Claude Code:

```bash
cd tools/the-architect && claude
```

- Adentro, arrancás con lenguaje natural:
  `Hola, quiero construir [TU IDEA]. Empezá la entrevista.`
- Atajo sin entrevista: `Just build it.`

Repo oficial: [Hainrixz/the-architect](https://github.com/Hainrixz/the-architect)

## 02 · Cyber Neo — blindá

Skill de auditoría de seguridad. Lanza cinco subagentes en paralelo (secretos expuestos,
dependencias vulnerables, infraestructura, supply chain y configuración) y deja un reporte
priorizado Critical → High → Medium → Low en el Escritorio.

- Instalada en [`.claude/skills/cyber-neo/`](../.claude/skills/cyber-neo/).
- Invocación sobre este proyecto: `/cyber-neo .`
- Sobre otra carpeta: `/cyber-neo /ruta/a/tu/proyecto`
- Usa Semgrep, Trivy, Gitleaks, pip-audit y cargo-audit si están instalados (funciona sin ellos).

Repo oficial: [Hainrixz/cyber-neo](https://github.com/Hainrixz/cyber-neo)

## 03 · All Deploy — publicá

Skill de despliegue en seis fases: Detect → Audit → Select → Deploy preview → Promote → Rollback.
Detecta el stack (Next, Vite, FastAPI, Express, etc.) y elige hosting
(Vercel, Railway, Docker+SSH o cloudflared tunnel).

- Instalada en [`.claude/skills/all-deploy/`](../.claude/skills/all-deploy/).
- Invocación: `/all-deploy` (interactivo) · `/all-deploy auto` · `/all-deploy step` · `/all-deploy local`
- También responde a frases naturales: "deploy this", "ship this", "push to prod".

Repo oficial: [Hainrixz/all-deploy](https://github.com/Hainrixz/all-deploy)

## Flujo recomendado

1. Diseñá el plano con The Architect (`cd tools/the-architect && claude`).
2. Construí con el `BLUEPRINT.md` como guía.
3. Auditá con `/cyber-neo .` y arreglá todo lo Critical/High.
4. Con el reporte limpio, desplegá con `/all-deploy` (interactivo la primera vez).
5. Promové a producción; si algo falla, All Deploy hace rollback solo.

> Nota: se excluyeron del repo las imágenes decorativas de los repos originales (~13 MB)
> para mantenerlo liviano. La funcionalidad está completa.
