from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class LoanApplication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Customer Info
    customer_name = models.CharField(max_length=255)
    customer_age = models.IntegerField(validators=[MinValueValidator(18), MaxValueValidator(120)])
    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    industry = models.CharField(max_length=255)
    years_at_job = models.IntegerField()
    employment_type = models.CharField(max_length=50)
    annual_income = models.DecimalField(max_digits=15, decimal_places=2)
    credit_score = models.IntegerField(validators=[MinValueValidator(300), MaxValueValidator(850)])
    total_assets = models.DecimalField(max_digits=15, decimal_places=2)
    total_liabilities = models.DecimalField(max_digits=15, decimal_places=2)
    net_worth = models.DecimalField(max_digits=15, decimal_places=2)
    savings_rate = models.IntegerField()
    monthly_savings = models.DecimalField(max_digits=15, decimal_places=2)
    credit_utilization = models.IntegerField()
    
    # Existing Debt
    car_loan_payment = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    car_loan_remaining_months = models.IntegerField(null=True, blank=True)
    credit_card_debt = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    student_loans = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    emergency_fund = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    retirement_accounts = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Loan Request
    loan_amount = models.DecimalField(max_digits=15, decimal_places=2)
    loan_purpose = models.CharField(max_length=255)
    loan_term_years = models.IntegerField()
    down_payment = models.DecimalField(max_digits=15, decimal_places=2)
    loan_to_value_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    interest_rate_offered = models.DecimalField(max_digits=5, decimal_places=3)
    
    # Property Details
    property_type = models.CharField(max_length=100)
    property_location = models.CharField(max_length=255)
    property_value_growth = models.CharField(max_length=50)
    property_tax_rate = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Market Factors
    economic_conditions_risk = models.CharField(max_length=50)
    job_stability_score = models.CharField(max_length=50)
    housing_market_volatility = models.CharField(max_length=50)
    inflation_rate = models.DecimalField(max_digits=5, decimal_places=2)
    interest_rate_trend = models.CharField(max_length=50)
    
    # Natural Language Input and JSON
    original_input_text = models.TextField()
    structured_data = models.JSONField(null=True, blank=True)
    
    status = models.CharField(
        max_length=50,
        default='pending',
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('review', 'Under Review'),
            ('cancelled', 'Cancelled')
        ]
    )
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'loan_applications_v2'

    def __str__(self):
        return f"Loan Application for {self.customer_name} - {self.status}"


class LoanAnalysisResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    loan_application = models.OneToOneField(LoanApplication, on_delete=models.CASCADE, related_name='analysis_result')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Customer Summary
    customer_name = models.CharField(max_length=255)
    customer_age = models.IntegerField()
    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    annual_income = models.DecimalField(max_digits=15, decimal_places=2)
    credit_score = models.IntegerField()
    net_worth = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Credit Risk Analysis
    risk_score = models.IntegerField()
    approval_probability = models.IntegerField()
    approval_recommendation = models.TextField()
    risk_factors = models.JSONField()  # Stored as array in JSON
    
    # Financial Health
    debt_to_income_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    loan_to_value_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    credit_utilization = models.IntegerField()
    savings_rate = models.IntegerField()
    monthly_savings = models.DecimalField(max_digits=15, decimal_places=2)
    total_assets = models.DecimalField(max_digits=15, decimal_places=2)
    total_liabilities = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Loan Metrics
    loan_amount = models.DecimalField(max_digits=15, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=3)
    monthly_payment = models.DecimalField(max_digits=15, decimal_places=2)
    total_interest_paid = models.DecimalField(max_digits=15, decimal_places=2)
    break_even_years = models.IntegerField()
    early_payment_savings = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Property Analysis
    property_type = models.CharField(max_length=100)
    property_location = models.CharField(max_length=255)
    property_value_growth = models.CharField(max_length=50)
    market_risk = models.CharField(max_length=50)
    property_tax_rate = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Economic Factors
    economic_conditions_risk = models.CharField(max_length=50)
    inflation_rate = models.DecimalField(max_digits=5, decimal_places=2)
    interest_rate_trend = models.CharField(max_length=50)
    
    # Chart Data
    debt_breakdown = models.JSONField()
    income_vs_expenses = models.JSONField()
    net_worth_composition = models.JSONField()
    loan_amortization = models.JSONField()
    
    status = models.CharField(
        max_length=50,
        default='pending',
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('review', 'Under Review'),
            ('cancelled', 'Cancelled')
        ]
    )
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'loan_analysis_results_v2'

    def __str__(self):
        return f"Analysis Result for {self.customer_name} - {self.status}"
