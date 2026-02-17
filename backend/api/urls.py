"""
API URL routing
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from api.views import (
    ProjectViewSet, CaseStudyViewSet, LeadViewSet, EventViewSet,
    FeatureFlagViewSet, StatsViewSet, HealthCheckView
)


# Demo login view
class DemoAuthView(APIView):
    """GET /api/auth/demo/ - Get demo JWT token"""
    def get(self, request):
        """Return demo JWT tokens"""
        refresh = RefreshToken()
        refresh['user_id'] = 1
        refresh['username'] = 'demo'
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': 1,
                'username': 'demo',
                'email': 'demo@portfolio.dev'
            }
        })


router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'case-studies', CaseStudyViewSet, basename='case-study')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'events', EventViewSet, basename='event')
router.register(r'feature-flags', FeatureFlagViewSet, basename='feature-flag')
router.register(r'stats', StatsViewSet, basename='stats')
router.register(r'health', HealthCheckView, basename='health')

urlpatterns = [
    path('', include(router.urls)),
    
    # JWT Auth
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Demo auth (without credentials)
    path('auth/demo/', DemoAuthView.as_view(), name='demo_auth'),
]
