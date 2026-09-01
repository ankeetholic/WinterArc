"""
Winter Arc URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from apps.analytics.views import DashboardView

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok'})

api_v1_patterns = [
    path('health/', health_check, name='health_check'),
    path('auth/', include('apps.accounts.urls', namespace='auth')),
    path('arcs/', include('apps.arcs.urls', namespace='arcs')),
    path('goals/', include('apps.goals.urls', namespace='goals')),
    path('daily-logs/', include('apps.tracking.urls', namespace='tracking')),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('analytics/', include('apps.analytics.urls', namespace='analytics')),
    path('workouts/', include('apps.workouts.urls', namespace='workouts')),
    path('ai/', include('apps.ai.urls', namespace='ai')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1_patterns)),
]
