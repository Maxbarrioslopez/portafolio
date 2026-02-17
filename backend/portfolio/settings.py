"""
Django settings for portfolio project.

ENVIRONMENT VARIABLES:
- SECRET_KEY: Django secret key (generate with python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
- DEBUG: True/False (NEVER True in production)
- ALLOWED_HOSTS: Comma-separated domain list (localhost,127.0.0.1,yourdomain.com)
- DATABASE_URL: PostgreSQL connection string (handled by Render)
- CORS_ALLOWED_ORIGINS: Comma-separated frontend URLs
- EMAIL_HOST_USER, EMAIL_HOST_PASSWORD: Gmail SMTP credentials
"""

import os
from pathlib import Path
from decouple import config

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR
FRONTEND_DIR = BASE_DIR.parent / "frontend"

# SECURITY: SECRET_KEY
SECRET_KEY = config(
    "SECRET_KEY",
    default="django-insecure-dev-key-change-in-production-immediately",
)
if DEBUG := config("DEBUG", default="False").lower() == "true":
    if "django-insecure" in SECRET_KEY:
        print("⚠️  WARNING: Using insecure SECRET_KEY in DEBUG mode. CHANGE BEFORE PRODUCTION.")

DEBUG = config("DEBUG", default="False").lower() == "true"

# Hosts - Render uses .onrender.com, support wildcard domains
ALLOWED_HOSTS_STR = config("ALLOWED_HOSTS", default="localhost,127.0.0.1")
# Parse ALLOWED_HOSTS: supports wildcards like .onrender.com
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR.split(",") if host.strip()]
# Add env hostname if running on Render
if os.environ.get("RENDER_EXTERNAL_HOSTNAME"):
    ALLOWED_HOSTS.append(os.environ.get("RENDER_EXTERNAL_HOSTNAME"))

# CORS & CSRF Configuration
CORS_ALLOWED_ORIGINS_STR = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,http://localhost:3000" if DEBUG else "https://*.onrender.com",
)
CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in CORS_ALLOWED_ORIGINS_STR.split(",") if origin.strip()
]
# Add Render hostname if available
if os.environ.get("RENDER_EXTERNAL_HOSTNAME"):
    CORS_ALLOWED_ORIGINS.append(f"https://{os.environ.get('RENDER_EXTERNAL_HOSTNAME')}")
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# Security Headers (HTTPS/HSTS only in production)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True  # ✅ CRITICAL: Prevent XSS cookie theft
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
else:
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True  # ✅ Even in dev, HTTPONLY is good practice
    SECURE_HSTS_SECONDS = 0

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "api",
]

# MIDDLEWARE: ORDER MATTERS
# Security → CORS → Session → Auth → Messages
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # ✅ Serve static files
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",  # ✅ Clickjacking protection
]

ROOT_URLCONF = "portfolio.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "portfolio.wsgi.application"

# Database Configuration
# ✅ Render uses DATABASE_URL automatically
# ✅ Fallback to SQLite for local development
if os.environ.get("DATABASE_URL"):
    import dj_database_url
    DATABASES = {"default": dj_database_url.config(conn_max_age=600, conn_health_checks=True)}
else:
    # Local development: SQLite by default
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "es-es"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ✅ WhiteNoise serves frontend build files
if (FRONTEND_DIR / "dist").exists():
    STATICFILES_DIRS = [FRONTEND_DIR / "dist"]
else:
    STATICFILES_DIRS = []

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# REST Framework Configuration
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": (
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",  # ✅ Prevent spam from unauthenticated clients
        "user": "1000/hour",
    },
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=int(config("JWT_EXPIRATION_HOURS", default="24"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ALGORITHM": config("JWT_ALGORITHM", default="HS256"),
    "SIGNING_KEY": SECRET_KEY,
}

# Logging Configuration
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {asctime} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": config("LOG_LEVEL", default="INFO"),
    },
}
