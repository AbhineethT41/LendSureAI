from rest_framework import serializers
from .models_v2 import LoanApplication, LoanAnalysisResult

class LoanApplicationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = LoanApplication
        fields = [
            'id', 'user_email', 'created_at', 'updated_at', 'status',
            # Customer Info
            'customer_name', 'customer_age', 'job_title', 'company', 'industry',
            'years_at_job', 'employment_type', 'annual_income', 'credit_score',
            'total_assets', 'total_liabilities', 'net_worth', 'savings_rate',
            'monthly_savings', 'credit_utilization',
            # Existing Debt
            'car_loan_payment', 'car_loan_remaining_months', 'credit_card_debt',
            'student_loans', 'emergency_fund', 'retirement_accounts',
            # Loan Request
            'loan_amount', 'loan_purpose', 'loan_term_years', 'down_payment',
            'loan_to_value_ratio', 'interest_rate_offered',
            # Property Details
            'property_type', 'property_location', 'property_value_growth',
            'property_tax_rate',
            # Market Factors
            'economic_conditions_risk', 'job_stability_score',
            'housing_market_volatility', 'inflation_rate', 'interest_rate_trend',
            # Natural Language Input and JSON
            'original_input_text', 'structured_data'
        ]
        read_only_fields = ['id', 'user_email', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        return LoanApplication.objects.create(user=user, **validated_data)


class LoanApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = LoanApplication
        fields = [
            'id', 'user_email', 'customer_name', 'loan_amount',
            'created_at', 'status'
        ]


class LoanAnalysisResultSerializer(serializers.ModelSerializer):
    loan_application_id = serializers.UUIDField(source='loan_application.id', read_only=True)
    
    class Meta:
        model = LoanAnalysisResult
        fields = [
            'id', 'loan_application_id', 'created_at', 'updated_at', 'status',
            # Customer Summary
            'customer_name', 'customer_age', 'job_title', 'company',
            'annual_income', 'credit_score', 'net_worth',
            # Credit Risk Analysis
            'risk_score', 'approval_probability', 'approval_recommendation',
            'risk_factors',
            # Financial Health
            'debt_to_income_ratio', 'loan_to_value_ratio', 'credit_utilization',
            'savings_rate', 'monthly_savings', 'total_assets', 'total_liabilities',
            # Loan Metrics
            'loan_amount', 'interest_rate', 'monthly_payment',
            'total_interest_paid', 'break_even_years', 'early_payment_savings',
            # Property Analysis
            'property_type', 'property_location', 'property_value_growth',
            'market_risk', 'property_tax_rate',
            # Economic Factors
            'economic_conditions_risk', 'inflation_rate', 'interest_rate_trend',
            # Chart Data
            'debt_breakdown', 'income_vs_expenses', 'net_worth_composition',
            'loan_amortization'
        ]
        read_only_fields = ['id', 'loan_application_id', 'created_at', 'updated_at']


class LoanAnalysisResultListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    loan_application_id = serializers.UUIDField(source='loan_application.id', read_only=True)

    class Meta:
        model = LoanAnalysisResult
        fields = [
            'id', 'loan_application_id', 'customer_name',
            'risk_score', 'approval_probability', 'created_at', 'status'
        ]
