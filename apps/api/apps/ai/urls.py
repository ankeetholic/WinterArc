from django.urls import path
from .views import ProgressiveOverloadAdviceView, AICoachChatView

app_name = 'ai'

urlpatterns = [
    path('progressive-overload/', ProgressiveOverloadAdviceView.as_view(), name='progressive-overload'),
    path('coach-chat/', AICoachChatView.as_view(), name='coach-chat'),
]
