#!/usr/bin/env python3
"""Launch the AI Personal Assistant server."""
import os
import uvicorn

if __name__ == "__main__":
    # Defaults are safe for local use: bind to loopback, no auto-reload.
    # For a real deployment, run behind an authenticating TLS reverse proxy and
    # set HOST/PORT via the environment. reload is enabled only when ENV=dev.
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("ENV") == "dev",
    )
