from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GoalViewSet

app_name = 'goals'

router = DefaultRouter()
router.register(r'', GoalViewSet, basename='goal')

urlpatterns = [
    path('', include(router.urls)),
]
