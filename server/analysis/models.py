from django.db import models
from django.contrib.auth.models import User

class Analysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    customer_input = models.TextField()
    customer_phone = models.CharField(max_length=20)
    analysis_result = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Analysis for {self.customer_phone} by {self.user.email}"
