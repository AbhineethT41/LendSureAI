from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_v2 import LoanApplicationViewSet, LoanAnalysisResultViewSet

router = DefaultRouter()
router.register(r'loan-applications', LoanApplicationViewSet, basename='loan-application')
router.register(r'loan-analyses', LoanAnalysisResultViewSet, basename='loan-analysis')

urlpatterns = [
    path('v2/', include(router.urls)),
]
