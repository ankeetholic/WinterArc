from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArcViewSet

app_name = 'arcs'

router = DefaultRouter()
router.register(r'', ArcViewSet, basename='arc')

urlpatterns = [
    path('', include(router.urls)),
]
