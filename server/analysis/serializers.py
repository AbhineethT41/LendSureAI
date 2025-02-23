from rest_framework import serializers
from .models import Analysis

class AnalysisSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Analysis
        fields = ['id', 'user_email', 'customer_input', 'customer_phone', 
                 'analysis_result', 'created_at', 'updated_at']
        read_only_fields = ['user_email', 'analysis_result', 'created_at', 'updated_at']
