"""
Django Admin customization
"""
from django.contrib import admin
from api.models import Project, CaseStudy, Lead, Event, FeatureFlag


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'featured', 'views', 'created_at')
    list_filter = ('status', 'featured', 'created_at')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'slug', 'description', 'long_description')
        }),
        ('Medios', {
            'fields': ('image', 'thumbnail')
        }),
        ('Stack & Tecnologías', {
            'fields': ('stack', 'technologies')
        }),
        ('URLs', {
            'fields': ('demo_url', 'repo_url', 'docs_url')
        }),
        ('Estado', {
            'fields': ('status', 'featured', 'published_at')
        }),
        ('Métricas', {
            'fields': ('views', 'github_stars'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('views', 'created_at', 'updated_at')


@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'views')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('related_projects',)
    fieldsets = (
        ('Información', {
            'fields': ('title', 'slug', 'description', 'featured_image')
        }),
        ('Contenido', {
            'fields': ('problem', 'solution', 'results', 'metrics')
        }),
        ('Técnico', {
            'fields': ('tech_stack', 'related_projects')
        }),
        ('Publicación', {
            'fields': ('published_at',)
        }),
    )


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email_hash', 'lead_type', 'created_at', 'read')
    list_filter = ('lead_type', 'read', 'created_at')
    search_fields = ('first_name', 'last_name', 'email')
    readonly_fields = ('email_hash', 'ip_hash', 'created_at', 'updated_at')
    fieldsets = (
        ('Información Personal (Anonimizada)', {
            'fields': ('first_name', 'last_name', 'email_hash', 'email', 'phone')
        }),
        ('Tipo de Lead', {
            'fields': ('lead_type', 'message')
        }),
        ('Cotización', {
            'fields': ('project_type', 'budget_range', 'timeline'),
            'classes': ('collapse',)
        }),
        ('Rastreo', {
            'fields': ('ip_hash', 'read', 'archived'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        queryset.update(read=True)
    mark_as_read.short_description = "Marcar como leído"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(read=False)
    mark_as_unread.short_description = "Marcar como no leído"


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'page', 'created_at')
    list_filter = ('event_type', 'page', 'created_at')
    search_fields = ('page',)
    readonly_fields = ('event_type', 'page', 'data', 'user_agent_hash', 'ip_hash', 'session_id', 'created_at')
    
    def has_add_permission(self, request):
        return False


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = ('name', 'key', 'enabled', 'rollout_percentage')
    list_filter = ('enabled',)
    search_fields = ('name', 'key')
    fieldsets = (
        ('Identificación', {
            'fields': ('name', 'key', 'description')
        }),
        ('Configuración', {
            'fields': ('enabled', 'rollout_percentage', 'config')
        }),
    )
