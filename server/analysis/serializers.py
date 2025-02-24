from rest_framework import serializers
from .models import Analysis
import json

class AnalysisSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    customer_name = serializers.SerializerMethodField()
    loan_amount = serializers.SerializerMethodField()
    status = serializers.CharField(required=False, default='pending')

    class Meta:
        model = Analysis
        fields = ['id', 'user_email', 'customer_input', 'customer_phone', 
                 'analysis_result', 'created_at', 'updated_at', 'customer_name', 'loan_amount',
                 'status']
        read_only_fields = ['user_email', 'analysis_result', 'created_at', 'updated_at']

    def get_customer_name(self, obj):
        try:
            if isinstance(obj.customer_input, str):
                customer_input = json.loads(obj.customer_input)
            else:
                customer_input = obj.customer_input
            
            return customer_input.get('customer_name', 'N/A')
        except:
            return 'N/A'

    def get_loan_amount(self, obj):
        try:
            if isinstance(obj.customer_input, str):
                customer_input = json.loads(obj.customer_input)
            else:
                customer_input = obj.customer_input
            
            return customer_input.get('loan_amount', None)
        except:
            return None

    def validate(self, data):
        # Ensure customer_input is properly formatted
        if 'customer_input' in data:
            if isinstance(data['customer_input'], str):
                try:
                    customer_input = json.loads(data['customer_input'])
                except json.JSONDecodeError:
                    raise serializers.ValidationError('Invalid JSON in customer_input')
            else:
                customer_input = data['customer_input']

            # Validate required fields
            required_fields = ['customer_name', 'customer_phone', 'loan_amount', 
                             'customer_details', 'loan_details', 'market_conditions']
            missing_fields = [field for field in required_fields 
                            if field not in customer_input]
            if missing_fields:
                raise serializers.ValidationError(
                    f'Missing required fields in customer_input: {missing_fields}')

        return data
