# 🚀 Portfolio Profesional - Producto Desplegable

Un **portfolio "producto"** completo y listo para producción, que sirve como demostración de capacidades técnicas y como herramienta de generación de leads. Construido con **Django 5 + React + Vite + TypeScript** en un **monorepo** desplegable en Render con un solo clic.

## 🎯 ¿Qué es este Proyecto?

Este no es un portfolio estático. Es un **sistema full-stack profesional** que demuestra:

- ✅ **Arquitectura escalable**: Backend con DRF + Frontend moderno
- ✅ **Autenticación real**: Django sessions (admin) + JWT (dashboard demo)
- ✅ **Analytics integrado**: Rastreo de pageviews, clicks y leads (sin PII)
- ✅ **API Explorer**: Los visitantes ven el sistema "por dentro"
- ✅ **Lead generation**: Formularios de contacto y cotización
- ✅ **Dashboard demo**: Panel de control real (solo lectura, usuario invitado)
- ✅ **SEO-friendly**: Server-side rendering vía Django (SPA con fallback)
- ✅ **Seguridad**: CORS, CSRF, SSL, variables de entorno

## 🏗️ ¿Por Qué Monorepo? (Y Cómo Mitigamos los Contras)

### Ventajas
| Beneficio | Descripción |
|-----------|-------------|
| **Una sola fuente de verdad** | Backend, frontend y docs versionados juntos |
| **Deploy simplificado** | Un solo Web Service en Render; menos puntos de falla |
| **Cambios coordinados** | Cuando cambias un endpoint, ajustas UI en el mismo PR |
| **DX mejor** | Scripts unificados (lint, test, build) y onboarding más rápido |
| **CI/CD más simple** | Una sola rama, un solo pipeline de build |

### Desventajas y Mitigación
| Desventaja | Mitigación |
|-----------|-----------|
| Repo crece (Git lento) | Estructura clara `/backend` y `/frontend` + `.gitignore` selectivo |
| Builds más lentos | Cache de dependencias en Render + builds por carpeta (npm solo frontend) |
| Equipos pisándose | Convenciones claras: API contract, TypeScript types, PRs por funcionalidad |
| Cambios que rompen | Versionado de API (`/api/v1/`), deprecations claros, tests |

## 📁 Estructura del Monorepo

```
portfolio/
├── backend/
│   ├── portfolio/              # Django project settings
│   │   ├── settings.py         # Configuración COMPLETA (JWT, CORS, STATIC, etc)
│   │   ├── urls.py             # Rutas principales
│   │   ├── wsgi.py             # WhiteNoise para servir frontend estático
│   │   └── asgi.py
│   ├── api/
│   │   ├── models.py           # Project, CaseStudy, Lead, Event, FeatureFlag
│   │   ├── serializers.py      # DRF serializers
│   │   ├── views.py            # ViewSets con permisos (público/demo/admin)
│   │   ├── urls.py             # Rutas API
│   │   ├── admin.py            # Django Admin personalizado
│   │   ├── apps.py
│   │   ├── fixtures/
│   │   │   └── initial_data.json # 6 proyectos, 2 case studies, eventos
│   │   └── migrations/
│   ├── manage.py
│   ├── pyproject.toml          # Dependencies + build config
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── pages/              # 13 rutas (Home, Projects, Lab, Dashboard, etc)
│   │   ├── components/         # Navigation, Footer, reutilizables
│   │   ├── lib/
│   │   │   ├── api.ts          # Cliente HTTP (axios + interceptores)
│   │   │   ├── apiClient.ts    # Funciones wrapper (getProjects, etc)
│   │   │   ├── analytics.ts    # Tracking (pageView, click, submit)
│   │   │   └── auth.ts         # Token management (JWT)
│   │   ├── App.tsx             # Router principal
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind
│   ├── index.html
│   ├── vite.config.ts          # Build → ../backend/frontend/dist
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .gitignore
├── build.sh                    # Script de build (frontend + migrations)
├── render.yaml                 # Configuración declarativa para Render
├── .gitignore
└── README.md
```

## 🗄️ Modelos Django

```python
# Project: Portfolio showcase
class Project(models.Model):
    title, slug, description, long_description
    image, thumbnail
    stack: JSONField           # ['django', 'react', ...]
    technologies: str          # Para búsqueda rápida
    status: 'prod' | 'demo' | 'archived'
    featured: bool
    demo_url, repo_url, docs_url
    github_stars
    views: int
    published_at, created_at, updated_at

# CaseStudy: Análisis técnico
class CaseStudy(models.Model):
    title, slug, description
    problem, solution, results
    metrics: JSONField         # {'time_saved': '40%', 'cost_reduction': '30%'}
    featured_image
    related_projects: M2M
    tech_stack: JSONField
    views: int
    published_at, created_at, updated_at

# Lead: Contactos y cotizaciones (anonimizados)
class Lead(models.Model):
    first_name, last_name, email, phone
    lead_type: 'contact' | 'quote'
    message
    project_type, budget_range, timeline  # Para cotizaciones
    email_hash: unique           # SHA256(email) para deduplicación
    ip_hash                      # Opcional, para análisis (hash, no IP real)
    read, archived
    created_at, updated_at

# Event: Analytics (page_view, click, submit, lab_endpoint_call)
class Event(models.Model):
    event_type: 'page_view' | 'click' | 'submit' | 'error' | 'lab_endpoint_call'
    page, data: JSONField
    user_agent_hash, ip_hash     # TODO: sin guardar PII
    session_id, created_at

# FeatureFlag: A/B testing y gradual rollout
class FeatureFlag(models.Model):
    name, key, description
    enabled: bool
    rollout_percentage: 0-100
    config: JSONField
    created_at, updated_at
```

## 🔌 Endpoints DRF (API)

### Públicos (sin autenticación)
```
GET  /api/health/                      # Status app/db
GET  /api/projects/                    # Lista filtrable y ordenable
GET  /api/projects/{slug}/             # Detalle (incrementa views)
GET  /api/projects/featured/           # Top 3 destacados
GET  /api/case-studies/                # Lista
GET  /api/case-studies/{slug}/         # Detalle
POST /api/leads/contact/               # Crear lead de contacto
POST /api/leads/quote/                 # Crear lead de cotización
POST /api/events/                      # Registrar evento (page_view, click, etc)
GET  /api/stats/public/                # Estadísticas públicas (agregadas)
GET  /api/feature-flags/               # Flags habilitados
```

### Demo Auth (JWT)
```
GET  /api/auth/demo/                   # Obtener token para usuario invitado
POST /api/auth/token/                  # JWT token (para admin, no usado en demo)
POST /api/auth/token/refresh/          # Refresh token
GET  /api/stats/dashboard/             # KPIs + top projects + leads recientes
GET  /api/leads/recent/                # Últimos leads (anonimizados)
```

### Admin (staff only, Django Admin)
```
CRUD vía /admin/
GET  /api/events/                      # Ver todos los eventos (staff)
GET  /api/leads/                       # Ver todos los leads (staff)
```

## 🎨 Vistas del Frontend (13 Rutas)

| Ruta | Componentes | Eventos | Descripción |
|------|-----------|--------|-------------|
| `/` | Hero + Featured Projects + Services + CTA Footer | page_view, click | Landing premium con vendedor integrado |
| `/projects` | ProjectGrid + Filters + Sort | page_view, click_card | Catálogo filtrable (stack, estado) |
| `/projects/:slug` | Header + Gallery + TechDetails + Links | page_view, click_link | Caso técnico con arquitectura |
| `/case-studies` | CaseStudyList (cards) | page_view | Lista de análisis estratégicos |
| `/case-studies/:slug` | Contexto + Restricciones + Decisiones | page_view | Caso completo con resultados |
| `/services` | PricingCards + AddOns + FAQ + CTA | page_view, click_whatsapp | Paquetes y servicios |
| `/quote` | Form (tipo, páginas, integraciones, etc) | page_view, submit_quote | Cotizador con estimación |
| `/lab` | ApiExplorer + JsonViewer + LatencyBadge | page_view, lab_call_endpoint | Ve el sistema "por dentro" |
| `/demo/login` | Botón "Entrar como invitado" | page_view, demo_login_success | Acceso al dashboard demo |
| `/dashboard` | KpiCards + TopProjectsTable + RecentLeads + SystemStatus | page_view, dashboard_tab_change | Panel real (solo lectura) |
| `/contact` | Form (nombre, email, mensaje, tipo) | page_view, submit_contact | Formulario de contacto |
| `/stats` (opcional) | Charts (visitas, top rutas, top clicks) | page_view | Estadísticas públicas agregadas |
| `/*` | Error message | page_view(404) | Página 404 amigable |

## 🔐 Seguridad y Configuración

### Django Settings (Relevantes)

```python
# SECRET_KEY (generar con: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
SECRET_KEY = config('SECRET_KEY', default='dev-key-change-me')

# DEBUG
DEBUG = config('DEBUG', default=False, cast=bool)

# CORS
CORS_ALLOWED_ORIGINS = ['https://yourdomain.com', 'http://localhost:5173']

# CSRF
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# Security headers
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0

# Database (PostgreSQL en Render)
DATABASE_URL = config('DATABASE_URL')

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'ALGORITHM': 'HS256',
}

# Static files (WhiteNoise)
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Frontend build
STATICFILES_DIRS = [FRONTEND_DIR / 'dist'] if (FRONTEND_DIR / 'dist').exists() else []
```

### WSGI (WhiteNoise)

```python
# portfolio/wsgi.py
from whitenoise import WhiteNoise

application = get_wsgi_application()
application = WhiteNoise(application, root='frontend/dist', prefix='')
```

El frontend build (`dist/`) es servido automáticamente por WhiteNoise desde Django. **Un solo Web Service en Render.**

## 🚀 Cómo Correr Local

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (o SQLite para dev rápido)

### Setup Backend

```bash
cd backend

# Crear venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -e .

# Configurar .env
cp .env.example .env
# Editar con tus valores (para SQLite en dev: comentar DATABASE_URL)

# Migrations
python manage.py migrate

# Cargar datos de ejemplo
python manage.py loaddata api/fixtures/initial_data.json

# Crear superuser (para /admin)
python manage.py createsuperuser

# Runserver
python manage.py runserver
# Visita: http://localhost:8000/admin
```

### Setup Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Dev server (proxy a http://localhost:8000/api)
npm run dev
# Visita: http://localhost:5173

# Build (copia a ../backend/frontend/dist)
npm run build
```

### Build Completo (como en Render)

```bash
bash build.sh
```

## 📦 Deploy en Render

### Opción 1: Automático (Recomendado)

1. Pushea el repo a GitHub
2. En Render.com: New → Blueprint → Conecta tu repo
3. Carga `render.yaml`
4. Render crea:
   - **Web Service** (backend + frontend estático)
   - **PostgreSQL Database** (starter plan)
5. Configura variables de entorno:
   - `SECRET_KEY` (genera una nueva)
   - `ALLOWED_HOSTS` (tu dominio Render)
   - Email (si quieres notificaciones)

**Build Command:**
```bash
bash build.sh
```

**Start Command:**
```bash
cd backend && gunicorn portfolio.wsgi:application --bind 0.0.0.0:$PORT
```

### Opción 2: Manual

1. Crea Web Service en Render
2. Conecta tu repo
3. Configura Build & Start (como arriba)
4. Crea PostgreSQL Database en Render
5. Copia `DATABASE_URL` a Web Service env vars

### Variables de Entorno Necesarias

```env
DEBUG=false
SECRET_KEY=your-generated-secret-key
ALLOWED_HOSTS=portfolio-app.onrender.com,yourdomain.com
DATABASE_URL=postgresql://user:pass@host:5432/db  # Render lo genera
CORS_ALLOWED_ORIGINS=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
JWT_EXPIRATION_HOURS=24
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 🔄 Cómo Funciona el Modo Demo

### Sin autenticación (público)
- Ver proyectos, case studies
- Enviar contactos y cotizaciones
- Acceder a Lab (API explorer)
- Ver estadísticas agregadas públicas

### Con autenticación demo (JWT invitado)
1. Usuario cliquea "Entrar como invitado" en `/demo/login`
2. Backend genera JWT con `is_demo: true`
3. Frontend almacena token en `localStorage`
4. Usuario puede ver dashboard (solo lectura):
   - KPIs: visitas, clicks, leads
   - Top proyectos por views
   - Últimos leads (anonimizados)
   - Health check del backend

### Admin (Django Admin)
- CRUD de Proyectos, Case Studies, Leads, Feature Flags
- Ver todos los eventos (analytics)
- Panel nativo de Django en `/admin`

## 📊 Cómo se Registran las Métricas

### Sin guardar PII (Personally Identifiable Information)

```python
# events/track.ts
const trackPageView = (page) => {
  trackEvent({
    event_type: 'page_view',
    page,  // '/projects', '/lab', etc
    data: {
      title: document.title,
      referrer: document.referrer,  // NO IP, NO email
    }
  })
}

const trackClick = (page, link) => {
  trackEvent({
    event_type: 'click',
    page,
    data: { link, label }  // link: 'github', 'demo', 'whatsapp', etc
  })
}
```

### En Backend (Anonimizado)

```python
# views.py
def create_event(request, validated_data):
    # Hash IP (solo para análisis de sesiones, no identifica)
    ip = request.META.get('REMOTE_ADDR')
    validated_data['ip_hash'] = hashlib.sha256(ip.encode()).hexdigest()
    
    # Hash User-Agent (para detectar bots, no identifica al usuario)
    user_agent = request.META.get('HTTP_USER_AGENT')
    validated_data['user_agent_hash'] = hashlib.sha256(user_agent.encode()).hexdigest()
    
    # Session ID (para agrupar eventos de una sesión)
    validated_data['session_id'] = request.session.session_key
    
    # NUNCA: email, teléfono, nombre (excepto en leads que son públicos)
```

### Queries de Analytics

```python
# /api/stats/public/
- Total de visitas hoy/7 días
- Top 5 páginas visitadas
- Top 5 enlaces clickeados (github, demo, whatsapp, etc)
- Todas las consultas son AGREGADAS

# /api/stats/dashboard/ (demo auth)
- Lo anterior +
- Total de leads
- Últimos 10 leads (anonimizados: first_name, email_hash, lead_type)
- Top 5 proyectos por views
```

## 🛠️ Scripts Útiles

### Backend

```bash
cd backend

# Migrations
python manage.py makemigrations
python manage.py migrate

# Cargar fixtures
python manage.py loaddata api/fixtures/initial_data.json

# Crear superuser
python manage.py createsuperuser

# Shell Django
python manage.py shell

# Tests
pytest

# Linting
black . && isort .
flake8 .
```

### Frontend

```bash
cd frontend

# Dev
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Type check
npm run type-check
```

### Monorepo

```bash
# Build completo (como Render)
bash build.sh

# Deploy a Render (push a main/master branch)
git push origin main
```

## 📝 Tipos TypeScript Compartidos (Opcional)

Para mayor robustez, puedes crear un paquete `@portfolio/types` compartido:

```
types/
├── api.ts
├── models.ts
└── package.json
```

```typescript
// types/models.ts
export interface Project {
  id: number
  title: string
  slug: string
  description: string
  stack: string[]
  status: 'prod' | 'demo' | 'archived'
  featured: boolean
  demo_url?: string
  repo_url?: string
}
```

Frontend e Backend pueden importar de aquí (npm install ../types en package.json).

## 🧪 Testing (Opcional Pero Recomendado)

### Backend (pytest)

```python
# api/tests/test_endpoints.py
import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_get_projects():
    client = APIClient()
    response = client.get('/api/projects/')
    assert response.status_code == 200
    assert 'results' in response.json()
```

Ejecutar:
```bash
pytest -v
```

### Frontend (Vitest)

```typescript
// src/__tests__/api.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getProjects } from '@/lib/apiClient'

describe('apiClient', () => {
  it('should fetch projects', async () => {
    const data = await getProjects()
    expect(data).toBeDefined()
  })
})
```

Ejecutar:
```bash
npm run test  # (configura en package.json)
```

## 📈 Performance & SEO

### Lighthouse Targets
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

### Optimizaciones Implementadas
- ✅ Vite (code splitting automático)
- ✅ React lazy loading (code splitting)
- ✅ WhiteNoise (compresión estática)
- ✅ PostgreSQL indexes (views, pages)
- ✅ Gzip en Render
- ✅ Meta tags básicos (title, description)
- ✅ Responsive design (mobile-first)

### Para Mejorar
- Agregar sitemap.xml
- Robots.txt
- Open Graph meta tags
- Structured data (JSON-LD)
- Preload críticos (fonts, images)

## 🚨 Troubleshooting

### "502 Bad Gateway" en Render
- Verifica `ALLOWED_HOSTS` (incluye dominio Render)
- Chequea logs: `gunicorn` corriendo en puerto `$PORT`
- PostgreSQL conectada (test: `python manage.py dbshell`)

### Frontend no carga en producción
- Verifica `npm run build` localmente
- Frontend dist debe estar en `backend/frontend/dist`
- WhiteNoise debe servir `index.html` para rutas SPA

### CORS error
- Añade URL frontend a `CORS_ALLOWED_ORIGINS`
- Asegura `CSRF_TRUSTED_ORIGINS` también

### JWT token expirado
- Frontend interceptor auto-refresh
- Si falla: usuario redirigido a `/demo/login`

## 📚 Recursos & Documentación

- [Django REST Framework](https://www.django-rest-framework.org/)
- [Vite](https://vitejs.dev/)
- [React Router v6](https://reactrouter.com/)
- [Render Docs](https://render.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)

## 📄 Licencia

MIT - Úsalo libremente para inspiración, modificación y redistribución.

## 👤 Autor

**Tu Nombre** - Full-Stack Developer

- 🌐 Portfolio: [yourdomain.com](https://yourdomain.com)
- 💼 LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- 🐙 GitHub: [@yourprofile](https://github.com/yourprofile)
- 📧 Email: hello@yourdomain.com

---

## 🙏 Agradecimientos

- Comunidad Django & React
- Render por el hosting sencillo
- Tailwind CSS por la velocidad de estilos

---

**¿Preguntas?** Abre un issue en GitHub o contáctame.

**Happy coding! 🚀**
