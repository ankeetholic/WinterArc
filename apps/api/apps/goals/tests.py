from datetime import date
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.arcs.models import Arc, ArcStatus
from apps.goals.models import Goal, GoalCategory, GoalFrequency

User = get_user_model()

class GoalsAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='goaluser@example.com', password='Password123!')
        self.client.force_authenticate(user=self.user)
        self.arc = Arc.objects.create(
            user=self.user,
            name='Winter Arc',
            start_date=date(2026, 9, 1),
            end_date=date(2026, 12, 31),
            status=ArcStatus.ACTIVE
        )
        self.list_url = reverse('goals:goal-list')
        self.today_url = reverse('goals:goal-today')

    def test_create_goal_success(self):
        payload = {
            'arc': str(self.arc.id),
            'name': 'Deep Work Coding',
            'category': GoalCategory.CODING,
            'target_value': 2.0,
            'unit': 'hours',
            'frequency': GoalFrequency.DAILY,
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], payload['name'])
        self.assertTrue(response.data['is_active'])

    def test_create_goal_for_other_user_arc_fails(self):
        other_user = User.objects.create_user(email='other@example.com', password='Password123!')
        other_arc = Arc.objects.create(
            user=other_user,
            name='Other Arc',
            start_date=date(2026, 9, 1),
            end_date=date(2026, 12, 31)
        )
        payload = {
            'arc': str(other_arc.id),
            'name': 'Unauthorized Goal',
            'target_value': 1.0,
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_today_goals_endpoint(self):
        goal = Goal.objects.create(
            arc=self.arc,
            name='Reading',
            target_value=30,
            unit='minutes',
            frequency=GoalFrequency.DAILY
        )
        response = self.client.get(self.today_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('goals', response.data)
        self.assertEqual(len(response.data['goals']), 1)
        self.assertEqual(response.data['goals'][0]['id'], str(goal.id))
        self.assertFalse(response.data['goals'][0]['completed'])
