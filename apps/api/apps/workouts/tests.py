from datetime import date
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.workouts.models import Workout, WorkoutExercise, WorkoutSet

User = get_user_model()

class WorkoutsAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(email='lifter1@example.com', password='Password123!')
        self.user2 = User.objects.create_user(email='lifter2@example.com', password='Password123!')
        self.client.force_authenticate(user=self.user1)
        self.list_url = reverse('workouts:workout-list')
        self.templates_url = reverse('workouts:workout-templates')
        self.start_template_url = reverse('workouts:workout-start-template')
        self.prs_url = reverse('workouts:workout-personal-records')

    def test_get_workout_templates(self):
        response = self.client.get(self.templates_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('routines', response.data)
        # 7 daily schedule routines + 1 home traps & neck routine = 8
        self.assertEqual(len(response.data['routines']), 8)
        self.assertEqual(response.data['routines'][0]['id'], 'day-1')
        self.assertEqual(len(response.data['routines'][0]['exercises']), 6)

    def test_start_workout_from_template(self):
        payload = {
            'template_id': 'day-1',
            'date': str(date(2026, 9, 1))
        }
        response = self.client.post(self.start_template_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('exercises', response.data)
        self.assertEqual(len(response.data['exercises']), 6)
        self.assertEqual(response.data['exercises'][0]['exercise_name'], 'Incline DB Press')
        # Check pre-created sets for first exercise (4 sets)
        self.assertEqual(len(response.data['exercises'][0]['sets']), 4)

    def test_log_workout_set(self):
        workout = Workout.objects.create(
            user=self.user1,
            name='Day 1 Chest',
            date=date(2026, 9, 1)
        )
        exercise = WorkoutExercise.objects.create(
            workout=workout,
            exercise_name='Incline DB Press',
            target_sets=3
        )
        log_set_url = reverse('workouts:workout-log-set', kwargs={'pk': workout.id})
        payload = {
            'exercise_id': str(exercise.id),
            'set_number': 1,
            'weight': 32.5,
            'repetitions': 8,
            'completed': True
        }
        response = self.client.post(log_set_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['weight']), 32.5)
        self.assertEqual(response.data['repetitions'], 8)
        self.assertTrue(response.data['completed'])

    def test_personal_records_calculation(self):
        workout = Workout.objects.create(
            user=self.user1,
            name='Chest Day',
            date=date(2026, 9, 1)
        )
        exercise = WorkoutExercise.objects.create(
            workout=workout,
            exercise_name='Incline DB Press'
        )
        WorkoutSet.objects.create(
            workout_exercise=exercise,
            set_number=1,
            weight=30.0,
            repetitions=10,
            completed=True
        )
        WorkoutSet.objects.create(
            workout_exercise=exercise,
            set_number=2,
            weight=34.0,
            repetitions=6,
            completed=True
        )
        response = self.client.get(self.prs_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('prs', response.data)
        self.assertEqual(len(response.data['prs']), 1)
        self.assertEqual(response.data['prs'][0]['exercise_name'], 'Incline DB Press')
        self.assertEqual(response.data['prs'][0]['max_weight'], 34.0)

    def test_workout_user_isolation(self):
        w2 = Workout.objects.create(
            user=self.user2,
            name='User 2 Workout',
            date=date(2026, 9, 1)
        )
        # User 1 should not see w2 in list
        response = self.client.get(self.list_url)
        self.assertEqual(response.data['count'], 0)

        # User 1 should not access w2 detail
        detail_url = reverse('workouts:workout-detail', kwargs={'pk': w2.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
