from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from supabase import create_client, Client
import os

# Initialize Supabase client
supabase: Client = create_client(
    supabase_url=settings.SUPABASE_URL,
    supabase_key=settings.SUPABASE_ANON_KEY
)

class Analysis(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('review', 'Under Review')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    customer_input = models.TextField()
    customer_phone = models.CharField(max_length=20)
    analysis_result = models.JSONField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    supabase_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        # Save to Supabase first
        data = {
            'user_email': self.user.email,
            'customer_input': self.customer_input,
            'customer_phone': self.customer_phone,
            'analysis_result': self.analysis_result,
            'status': self.status
        }
        
        if not self.supabase_id:
            # Create new record in Supabase
            result = supabase.table('analyses').insert(data).execute()
            if result.data:
                self.supabase_id = result.data[0]['id']
        else:
            # Update existing record in Supabase
            supabase.table('analyses').update(data).eq('id', self.supabase_id).execute()
            
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"Analysis for {self.customer_phone} by {self.user.email}"
