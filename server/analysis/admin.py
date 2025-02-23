from django.contrib import admin
from .models import Analysis

@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'customer_phone', 'created_at', 'updated_at')
    list_filter = ('created_at', 'user')
    search_fields = ('customer_phone', 'customer_input')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)
