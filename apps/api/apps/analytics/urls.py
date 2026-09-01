from django.urls import path
from .views import (
    DailyScoreView,
    StreakView,
    HeatmapView,
    WeeklyAnalyticsView,
    MonthlyAnalyticsView,
    GoalAnalyticsView
)

app_name = 'analytics'

urlpatterns = [
    path('daily-score/', DailyScoreView.as_view(), name='daily_score'),
    path('streak/', StreakView.as_view(), name='streak'),
    path('heatmap/', HeatmapView.as_view(), name='heatmap'),
    path('weekly/', WeeklyAnalyticsView.as_view(), name='weekly'),
    path('monthly/', MonthlyAnalyticsView.as_view(), name='monthly'),
    path('goals/', GoalAnalyticsView.as_view(), name='goals'),
]
