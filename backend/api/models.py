"""
Models for portfolio API
"""
from django.db import models
from django.core.validators import URLValidator
from django.utils.text import slugify
import hashlib
import json


class Project(models.Model):
    """Portfolio project"""
    STACK_CHOICES = [
        ('django', 'Django'),
        ('react', 'React'),
        ('nextjs', 'Next.js'),
        ('fastapi', 'FastAPI'),
        ('nodejs', 'Node.js'),
        ('rust', 'Rust'),
        ('python', 'Python'),
        ('typescript', 'TypeScript'),
        ('devops', 'DevOps'),
    ]
    
    STATUS_CHOICES = [
        ('prod', 'Production'),
        ('demo', 'Demo'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    long_description = models.TextField(blank=True)
    
    image = models.ImageField(upload_to='projects/', null=True, blank=True)
    thumbnail = models.ImageField(upload_to='projects/thumbs/', null=True, blank=True)
    
    stack = models.JSONField(default=list)  # ['django', 'react', ...]
    technologies = models.CharField(max_length=500, blank=True)  # CSV for quick display
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='demo')
    featured = models.BooleanField(default=False)
    
    demo_url = models.URLField(blank=True, null=True)
    repo_url = models.URLField(blank=True, null=True)
    docs_url = models.URLField(blank=True, null=True)
    
    github_stars = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    views = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-published_at', '-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class CaseStudy(models.Model):
    """Detailed case study for complex projects"""
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    
    problem = models.TextField()
    solution = models.TextField()
    results = models.TextField()
    
    metrics = models.JSONField(default=dict)  # {'time_saved': '40%', 'cost_reduction': '30%'}
    
    featured_image = models.ImageField(upload_to='case_studies/', null=True, blank=True)
    
    related_projects = models.ManyToManyField(Project, related_name='case_studies', blank=True)
    
    tech_stack = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    views = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-published_at', '-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Lead(models.Model):
    """Contact or quote request"""
    LEAD_TYPE_CHOICES = [
        ('contact', 'Contact'),
        ('quote', 'Quote Request'),
        ('other', 'Other'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    lead_type = models.CharField(max_length=20, choices=LEAD_TYPE_CHOICES, default='contact')
    message = models.TextField()
    
    # Quote specifics
    project_type = models.CharField(max_length=100, blank=True)
    budget_range = models.CharField(max_length=50, blank=True)
    timeline = models.CharField(max_length=50, blank=True)
    
    # Anonymization
    email_hash = models.CharField(max_length=64, unique=True, db_index=True)
    ip_hash = models.CharField(max_length=64, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    read = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.lead_type}"
    
    def save(self, *args, **kwargs):
        if not self.email_hash:
            self.email_hash = hashlib.sha256(self.email.lower().encode()).hexdigest()
        super().save(*args, **kwargs)


class Event(models.Model):
    """Analytics events (page views, clicks, submissions)"""
    EVENT_TYPE_CHOICES = [
        ('page_view', 'Page View'),
        ('click', 'Click'),
        ('submit', 'Form Submit'),
        ('error', 'Error'),
        ('lab_endpoint_call', 'Lab API Call'),
    ]

    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES)
    page = models.CharField(max_length=200)
    
    # Event data
    data = models.JSONField(default=dict)  # {'button': 'CTA', 'link': 'github', ...}
    
    # User tracking (anonymized)
    user_agent_hash = models.CharField(max_length=64, blank=True)
    ip_hash = models.CharField(max_length=64, blank=True)
    
    # Session tracking
    session_id = models.CharField(max_length=100, blank=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['page', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.page}"


class FeatureFlag(models.Model):
    """Feature flags for A/B testing and gradual rollouts"""
    
    name = models.CharField(max_length=100, unique=True)
    key = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True)
    
    enabled = models.BooleanField(default=False)
    
    # Rollout percentage (0-100)
    rollout_percentage = models.IntegerField(default=0)
    
    # Configuration
    config = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def is_enabled_for_user(self, user_id=None):
        """Check if feature is enabled for a user"""
        if not self.enabled:
            return False
        
        if self.rollout_percentage >= 100:
            return True
        
        if user_id is None:
            return False
        
        # Hash-based rollout
        hash_value = int(hashlib.md5(f"{user_id}:{self.key}".encode()).hexdigest(), 16)
        return (hash_value % 100) < self.rollout_percentage
