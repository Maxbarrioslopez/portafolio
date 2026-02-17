"""
ViewSets and Views for API endpoints
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from api.models import Project, CaseStudy, Lead, Event, FeatureFlag
from api.serializers import (
    ProjectSerializer, ProjectDetailSerializer,
    CaseStudySerializer, CaseStudyDetailSerializer,
    LeadCreateSerializer, LeadListSerializer,
    EventSerializer, EventCreateSerializer,
    FeatureFlagSerializer, StatsPublicSerializer, StatsDashboardSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permission for read-only or owner"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class ProjectViewSet(viewsets.ModelViewSet):
    """
    Projects endpoint
    - GET /api/projects/ → list all (public)
    - GET /api/projects/{slug}/ → detail (public)
    - POST/PUT/DELETE → staff only
    """
    queryset = Project.objects.filter(status__in=['prod', 'demo'])
    serializer_class = ProjectSerializer
    lookup_field = 'slug'
    permission_classes = [IsOwnerOrReadOnly]
    filterset_fields = ['status', 'featured']
    search_fields = ['title', 'description', 'technologies']
    ordering_fields = ['created_at', 'views', 'published_at']
    ordering = ['-published_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Increment views on detail retrieval"""
        response = super().retrieve(request, *args, **kwargs)
        project = self.get_object()
        project.views += 1
        project.save(update_fields=['views'])
        return response
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured projects"""
        projects = self.queryset.filter(featured=True)[:3]
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)


class CaseStudyViewSet(viewsets.ModelViewSet):
    """
    Case Studies endpoint
    - GET /api/case-studies/ → list
    - GET /api/case-studies/{slug}/ → detail
    """
    queryset = CaseStudy.objects.filter(published_at__isnull=False)
    serializer_class = CaseStudySerializer
    lookup_field = 'slug'
    permission_classes = [IsOwnerOrReadOnly]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'published_at']
    ordering = ['-published_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CaseStudyDetailSerializer
        return CaseStudySerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Increment views"""
        response = super().retrieve(request, *args, **kwargs)
        case_study = self.get_object()
        case_study.views += 1
        case_study.save(update_fields=['views'])
        return response


class LeadViewSet(viewsets.ModelViewSet):
    """
    Leads endpoint
    - POST /api/leads/contact/ → public
    - POST /api/leads/quote/ → public
    - GET /api/leads/recent/ → demo (recent, anonymized)
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Lead.objects.all()
        return Lead.objects.none()
    
    def get_serializer_class(self):
        if self.action in ['create', 'contact', 'quote']:
            return LeadCreateSerializer
        return LeadListSerializer
    
    @action(detail=False, methods=['post'])
    def contact(self, request):
        """POST /api/leads/contact/"""
        serializer = LeadCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(lead_type='contact')
            return Response({'message': 'Gracias por tu mensaje'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def quote(self, request):
        """POST /api/leads/quote/"""
        serializer = LeadCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(lead_type='quote')
            return Response({'message': 'Cotización solicitada'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def recent(self, request):
        """GET /api/leads/recent/ - Demo view (anonimizado)"""
        if not request.user.is_authenticated:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        recent_leads = Lead.objects.all().order_by('-created_at')[:10]
        serializer = LeadListSerializer(recent_leads, many=True)
        return Response(serializer.data)


class EventViewSet(viewsets.ModelViewSet):
    """
    Events endpoint
    - POST /api/events/ → track events (public)
    - GET /api/events/ → admin only
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['event_type', 'page']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EventCreateSerializer
        return EventSerializer
    
    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Event.objects.all()
        return Event.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Track analytics events"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Event tracked'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FeatureFlagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Feature flags (read-only for all, writable by admin via Django admin)
    """
    queryset = FeatureFlag.objects.filter(enabled=True)
    serializer_class = FeatureFlagSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'key'


class StatsViewSet(viewsets.ViewSet):
    """
    Stats endpoints
    - GET /api/stats/public/ → public stats
    - GET /api/stats/dashboard/ → demo auth required
    """
    permission_classes = [permissions.AllowAny]
    
    def _get_date_range(self, days=1):
        """Helper to get date range"""
        now = timezone.now()
        start = now - timedelta(days=days)
        return start, now
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public(self, request):
        """Public statistics (aggregated)"""
        today_start, now = self._get_date_range(1)
        week_start, _ = self._get_date_range(7)
        
        # Count events
        today_views = Event.objects.filter(
            event_type='page_view',
            created_at__gte=today_start,
            created_at__lte=now
        ).count()
        
        week_views = Event.objects.filter(
            event_type='page_view',
            created_at__gte=week_start
        ).count()
        
        today_clicks = Event.objects.filter(
            event_type='click',
            created_at__gte=today_start
        ).count()
        
        # Top pages
        top_pages = Event.objects.filter(
            event_type='page_view'
        ).values('page').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Top clicks
        top_clicks = Event.objects.filter(
            event_type='click'
        ).values('data__link').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        data = {
            'total_views_today': today_views,
            'total_views_7d': week_views,
            'total_clicks_today': today_clicks,
            'top_pages': [p['page'] for p in top_pages],
            'top_clicks': {str(c.get('data__link', 'unknown')): c['count'] for c in top_clicks}
        }
        
        return Response(data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard(self, request):
        """Dashboard statistics (demo auth required)"""
        today_start, now = self._get_date_range(1)
        week_start, _ = self._get_date_range(7)
        
        stats = {
            'total_views_today': Event.objects.filter(
                event_type='page_view',
                created_at__gte=today_start
            ).count(),
            'total_views_7d': Event.objects.filter(
                event_type='page_view',
                created_at__gte=week_start
            ).count(),
            'total_clicks_today': Event.objects.filter(
                event_type='click',
                created_at__gte=today_start
            ).count(),
            'total_leads': Lead.objects.count(),
            'recent_leads': Lead.objects.all()[:10],
            'top_projects': Project.objects.all().order_by('-views')[:5],
            'top_pages': list(Event.objects.filter(
                event_type='page_view'
            ).values('page').annotate(
                count=Count('id')
            ).order_by('-count')[:5]),
        }
        
        serializer = StatsDashboardSerializer(stats)
        return Response(serializer.data)


class HealthCheckView(viewsets.ViewSet):
    """
    Health check
    """
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def health(self, request):
        """GET /api/health/"""
        from django.db import connection
        
        db_ok = True
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception as e:
            db_ok = False
        
        return Response({
            'status': 'ok' if db_ok else 'degraded',
            'database': 'connected' if db_ok else 'error',
            'timestamp': timezone.now().isoformat()
        })
