"""
Main URL configuration for portfolio.

Routing:
- /admin/          → Django Admin (protected)
- /api/            → REST API (DRF)
- /api-auth/       → DRF browsable API auth
- /* (fallback)    → React SPA (for React Router)
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

# ✅ SPA View for React Router fallback
class SpaView(TemplateView):
    """
    Serves index.html for React Router.
    
    Only used for SPA routes (not /api, /admin, /static).
    All React Router navigation happens client-side.
    """
    template_name = "index.html"
    content_type = "text/html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["debug"] = settings.DEBUG
        return context


# URL patterns: MOST SPECIFIC FIRST
urlpatterns = [
    # Admin interface (must be first, most specific)
    path("admin/", admin.site.urls),
    
    # API routes (second most specific)
    path("api/", include("api.urls")),
    path("api-auth/", include("rest_framework.urls")),
    
    # ✅ SPA Fallback (MUST be last, least specific)
    # Catches all remaining routes and serves React
    path("", SpaView.as_view(), name="index"),
    path("<path:path>", SpaView.as_view(), name="spa-fallback"),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Static files served by WhiteNoise in production
    if not settings.DEBUG:
        urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
