"""
WSGI config for portfolio project.

Serves Django backend + static frontend files using WhiteNoise.
"""

import os
from pathlib import Path

from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio.settings")

application = get_wsgi_application()

# ✅ WhiteNoise configuration
# Serves:
# - /static/* → frontend build files (dist)
# - /admin/* → Django admin
# - /api/* → REST API
# - /* → falls back to React SPA (via urls.py)
FRONTEND_BUILD = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if FRONTEND_BUILD.exists():
    # Use absolute path (works in Render)
    application = WhiteNoise(
        application,
        root=str(FRONTEND_BUILD),
        prefix="static/",
        mimetypes={".js": "text/javascript; charset=utf-8"},
    )
else:
    print(
        "⚠️  WARNING: frontend/dist not found. "
        "Run 'npm run build' in frontend/ to generate it."
    )
