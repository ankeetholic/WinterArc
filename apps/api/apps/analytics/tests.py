from datetime import date, timedelta
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.arcs.models import Arc, ArcStatus
from apps.goals.models import Goal, GoalCategory, GoalFrequency
from apps.tracking.models import DailyLog
from apps.analytics.services.scoring import calculate_daily_score
from apps.analytics.services.streaks import calculate_streaks
from apps.analytics.services.heatmap import generate_heatmap_data

User = get_user_model()

class AnalyticsAndServicesTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='analytics@example.com', password='Password123!')
        self.client.force_authenticate(user=self.user)
        self.arc = Arc.objects.create(
            user=self.user,
            name='Winter Arc',
            start_date=date(2026, 9, 1),
            end_date=date(2026, 12, 31),
            status=ArcStatus.ACTIVE
        )
        self.goal1 = Goal.objects.create(
            arc=self.arc,
            name='Coding',
            category=GoalCategory.CODING,
            target_value=2.0,
            unit='hours'
        )
        self.goal2 = Goal.objects.create(
            arc=self.arc,
            name='Workout',
            category=GoalCategory.FITNESS,
            target_value=1.0,
            unit='sessions'
        )

    def test_calculate_daily_score(self):
        target_date = date(2026, 9, 1)
        # Log only goal 1 completed
        DailyLog.objects.create(goal=self.goal1, date=target_date, completed=True, value=2.0)
        
        score_data = calculate_daily_score(self.user, target_date)
        self.assertEqual(score_data['total'], 2)
        self.assertEqual(score_data['completed'], 1)
        self.assertEqual(score_data['score'], 0.5)
        self.assertEqual(score_data['percentage'], 50)

        # Log goal 2 completed
        DailyLog.objects.create(goal=self.goal2, date=target_date, completed=True, value=1.0)
        score_data = calculate_daily_score(self.user, target_date)
        self.assertEqual(score_data['completed'], 2)
        self.assertEqual(score_data['score'], 1.0)
        self.assertEqual(score_data['percentage'], 100)

    def test_calculate_streaks(self):
        # 3 consecutive days completed
        d1 = date(2026, 9, 1)
        d2 = date(2026, 9, 2)
        d3 = date(2026, 9, 3)

        for d in [d1, d2, d3]:
            DailyLog.objects.create(goal=self.goal1, date=d, completed=True, value=2.0)
            DailyLog.objects.create(goal=self.goal2, date=d, completed=True, value=1.0)

        streaks = calculate_streaks(self.user)
        self.assertGreaterEqual(streaks['best_streak'], 3)

    def test_heatmap_generation(self):
        d1 = date(2026, 9, 1)
        DailyLog.objects.create(goal=self.goal1, date=d1, completed=True, value=2.0)
        
        data = generate_heatmap_data(self.user, start_date=d1, end_date=date(2026, 9, 5))
        self.assertEqual(len(data['days']), 5)
        self.assertEqual(data['days'][0]['completed'], 1)
        self.assertEqual(data['days'][0]['score'], 0.5)

    def test_dashboard_endpoint(self):
        dashboard_url = reverse('dashboard')
        response = self.client.get(dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('arc', response.data)
        self.assertIn('today', response.data)
        self.assertIn('streak', response.data)
        self.assertIn('goals', response.data)
        self.assertEqual(len(response.data['goals']), 2)
