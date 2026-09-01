from datetime import date
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.arcs.models import Arc, ArcStatus
from apps.goals.models import Goal, GoalCategory, GoalFrequency
from apps.tracking.models import DailyLog

User = get_user_model()

class TrackingAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='tracker@example.com', password='Password123!')
        self.client.force_authenticate(user=self.user)
        self.arc = Arc.objects.create(
            user=self.user,
            name='Winter Arc',
            start_date=date(2026, 9, 1),
            end_date=date(2026, 12, 31),
            status=ArcStatus.ACTIVE
        )
        self.goal = Goal.objects.create(
            arc=self.arc,
            name='Coding',
            category=GoalCategory.CODING,
            target_value=2.0,
            unit='hours',
            frequency=GoalFrequency.DAILY
        )
        self.list_url = reverse('tracking:daily-log-list')

    def test_create_daily_log_success(self):
        payload = {
            'goal': str(self.goal.id),
            'date': str(date(2026, 9, 1)),
            'value': 2.5,
            'notes': 'Crushed deep work session'
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['completed'])
        self.assertEqual(DailyLog.objects.count(), 1)

    def test_prevent_duplicate_daily_log_for_same_goal_and_date(self):
        payload = {
            'goal': str(self.goal.id),
            'date': str(date(2026, 9, 1)),
            'value': 2.0,
            'completed': True
        }
        self.client.post(self.list_url, payload, format='json')
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_filter_logs_by_date(self):
        DailyLog.objects.create(
            goal=self.goal,
            date=date(2026, 9, 1),
            completed=True,
            value=2.0
        )
        DailyLog.objects.create(
            goal=self.goal,
            date=date(2026, 9, 2),
            completed=True,
            value=2.0
        )
        response = self.client.get(f"{self.list_url}?date=2026-09-01")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['date'], '2026-09-01')
