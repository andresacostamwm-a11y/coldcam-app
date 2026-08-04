# <project-name>

A HyperFrames video composition. Plain HTML + GSAP; rendered to MP4 by the `hyperframes` CLI.

## Requirements

- **Node.js 22+** -- [nodejs.org](https://nodejs.org/)
- **FFmpeg** -- `brew install ffmpeg` (macOS) or `sudo apt install ffmpeg` (Debian/Ubuntu) or [ffmpeg.org/download](https://ffmpeg.org/download.html) (Windows)

Verify: `npx hyperframes doctor`

## Preview

```bash
npx hyperframes preview
```

Opens the HyperFrames Studio at `http://localhost:3002` with frame-accurate scrubbing.

## Refine with Claude Code

This project was drafted in Claude Design. To polish animations, timing, and pacing:

```bash
npx skills add heygen-com/hyperframes   # install HyperFrames skills (one-time)
npx hyperframes lint                     # verify structure (should pass with zero errors)
npx hyperframes preview                  # open the studio for live feedback
```

Then open in Claude Code and iterate:

- "Make scene 3's entrance snappier"
- "Add a counter animation to the stat in scene 5"
- "Tighten the pacing -- scenes 4 and 6 feel too long"
- "Change the shader on transition 3 to glitch"

## Render

Run from the project directory (the folder containing `index.html`). The
positional argument is the project directory, not a file, so pass a specific
composition with `-c` rather than as a bare path.

```bash
npx hyperframes render -o output.mp4
```

1920x1080 / 30fps by default. Use `--fps 60` or `--resolution 4k` to override.
