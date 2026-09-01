from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailyLogViewSet

app_name = 'tracking'

router = DefaultRouter()
router.register(r'', DailyLogViewSet, basename='daily-log')

urlpatterns = [
    path('', include(router.urls)),
]
