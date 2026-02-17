"""
Serializers for API endpoints
"""
from rest_framework import serializers
from api.models import Project, CaseStudy, Lead, Event, FeatureFlag
import hashlib


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'description', 'long_description',
            'image', 'thumbnail', 'stack', 'technologies', 'status',
            'featured', 'demo_url', 'repo_url', 'docs_url', 'github_stars',
            'created_at', 'updated_at', 'published_at', 'views'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'views']


class ProjectDetailSerializer(ProjectSerializer):
    """Extended serializer for detailed view"""
    case_studies = serializers.SerializerMethodField()
    
    def get_case_studies(self, obj):
        case_studies = obj.case_studies.all()
        return CaseStudySerializer(case_studies, many=True).data


class CaseStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudy
        fields = [
            'id', 'title', 'slug', 'description', 'problem', 'solution',
            'results', 'metrics', 'featured_image', 'tech_stack',
            'created_at', 'updated_at', 'published_at', 'views'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'views']


class CaseStudyDetailSerializer(CaseStudySerializer):
    """Extended serializer with related projects"""
    related_projects = ProjectSerializer(many=True, read_only=True)


class LeadCreateSerializer(serializers.ModelSerializer):
    """For public lead creation"""
    class Meta:
        model = Lead
        fields = ['first_name', 'last_name', 'email', 'phone', 'lead_type', 'message', 'project_type', 'budget_range', 'timeline']
    
    def create(self, validated_data):
        # Add anonymized IP if available
        request = self.context.get('request')
        if request:
            ip = request.META.get('REMOTE_ADDR', '')
            if ip:
                validated_data['ip_hash'] = hashlib.sha256(ip.encode()).hexdigest()
        return super().create(validated_data)


class LeadListSerializer(serializers.ModelSerializer):
    """For admin viewing (anonymized)"""
    class Meta:
        model = Lead
        fields = ['id', 'first_name', 'last_name', 'email_hash', 'lead_type', 'created_at', 'read']
        read_only_fields = fields


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'event_type', 'page', 'data', 'created_at']
        read_only_fields = ['id', 'created_at']


class EventCreateSerializer(serializers.ModelSerializer):
    """For creating events from frontend"""
    class Meta:
        model = Event
        fields = ['event_type', 'page', 'data']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            # Hash user agent
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            if user_agent:
                validated_data['user_agent_hash'] = hashlib.sha256(user_agent.encode()).hexdigest()
            
            # Hash IP
            ip = request.META.get('REMOTE_ADDR', '')
            if ip:
                validated_data['ip_hash'] = hashlib.sha256(ip.encode()).hexdigest()
            
            # Session ID
            session_id = request.session.session_key
            if session_id:
                validated_data['session_id'] = session_id
        
        return super().create(validated_data)


class FeatureFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureFlag
        fields = ['name', 'key', 'description', 'enabled', 'config']
        read_only_fields = fields


class StatsPublicSerializer(serializers.Serializer):
    """Stats for public view"""
    total_views_today = serializers.IntegerField()
    total_views_7d = serializers.IntegerField()
    total_clicks_today = serializers.IntegerField()
    top_pages = serializers.ListField()
    top_clicks = serializers.DictField()


class StatsDashboardSerializer(serializers.Serializer):
    """Stats for demo dashboard"""
    total_views_today = serializers.IntegerField()
    total_views_7d = serializers.IntegerField()
    total_clicks_today = serializers.IntegerField()
    total_leads = serializers.IntegerField()
    recent_leads = LeadListSerializer(many=True)
    top_projects = ProjectSerializer(many=True)
    top_pages = serializers.ListField()
