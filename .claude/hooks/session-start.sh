#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Install Python dependencies
if [ -f "$PROJECT_DIR/requirements.txt" ]; then
  pip install -r "$PROJECT_DIR/requirements.txt" --quiet
fi

# Install Node.js dependencies for the video package
if [ -f "$PROJECT_DIR/video/package.json" ]; then
  npm install --prefix "$PROJECT_DIR/video" --silent
fi
