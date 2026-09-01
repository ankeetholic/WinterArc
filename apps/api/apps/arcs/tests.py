from datetime import date, timedelta
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.arcs.models import Arc, ArcStatus

User = get_user_model()

class ArcsAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(email='user1@example.com', password='Password123!')
        self.user2 = User.objects.create_user(email='user2@example.com', password='Password123!')
        self.client.force_authenticate(user=self.user1)
        self.list_url = reverse('arcs:arc-list')
        self.active_url = reverse('arcs:arc-active')

    def test_create_arc_success(self):
        payload = {
            'name': 'Winter Arc 2026',
            'description': 'Consistency focus',
            'start_date': str(date(2026, 9, 1)),
            'end_date': str(date(2026, 12, 31)),
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], payload['name'])
        self.assertEqual(response.data['status'], ArcStatus.ACTIVE)
        self.assertEqual(Arc.objects.filter(user=self.user1).count(), 1)

    def test_create_arc_invalid_dates_fails(self):
        payload = {
            'name': 'Invalid Arc',
            'start_date': str(date(2026, 12, 31)),
            'end_date': str(date(2026, 9, 1)),
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_arc_isolation_between_users(self):
        arc2 = Arc.objects.create(
            user=self.user2,
            name="User 2 Arc",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 12, 31),
        )
        # User 1 should not see User 2's arc in list
        response = self.client.get(self.list_url)
        self.assertEqual(response.data['count'], 0)

        # User 1 should not access User 2's arc detail
        detail_url = reverse('arcs:arc-detail', kwargs={'pk': arc2.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_active_arc_endpoint(self):
        arc = Arc.objects.create(
            user=self.user1,
            name="Active Arc",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 12, 31),
            status=ArcStatus.ACTIVE
        )
        response = self.client.get(self.active_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], str(arc.id))
