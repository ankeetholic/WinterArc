from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from datetime import date
from apps.workouts.models import Workout, WorkoutExercise, WorkoutSet

User = get_user_model()

class AIProgressiveOverloadTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='athlete@winterarc.com',
            password='Password123!',
            first_name='Aesthetic',
            last_name='Lifter'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_baseline_progressive_overload_unlogged(self):
        """Test that unlogged exercise returns baseline numbers without error."""
        response = self.client.post('/api/v1/ai/progressive-overload/', {
            'exercise_name': 'Incline Dumbbell Press',
            'target_sets': 3,
            'target_reps': '8-12',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['action'], 'ESTABLISH_BASELINE')
        self.assertFalse(response.data['has_history'])
        self.assertEqual(response.data['suggested_weight'], 10.0)

    def test_double_progression_increase_weight(self):
        """Test that hitting top of rep range triggers INCREASE_WEIGHT (+2.5kg)."""
        workout = Workout.objects.create(
            user=self.user,
            name='Chest & Triceps',
            date=date(2026, 8, 28),
            duration_minutes=50
        )
        exercise = WorkoutExercise.objects.create(
            workout=workout,
            exercise_name='Incline Dumbbell Press',
            primary_focus='Upper Chest',
            target_sets=3,
            target_reps='8-12',
            order=1
        )
        # 3 completed sets hitting 12 reps at 24kg
        for i in range(1, 4):
            WorkoutSet.objects.create(
                workout_exercise=exercise,
                set_number=i,
                weight=24.0,
                repetitions=12,
                completed=True
            )

        response = self.client.post('/api/v1/ai/progressive-overload/', {
            'exercise_name': 'Incline Dumbbell Press',
            'target_sets': 3,
            'target_reps': '8-12',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['action'], 'INCREASE_WEIGHT')
        self.assertTrue(response.data['has_history'])
        self.assertEqual(response.data['suggested_weight'], 26.5)

    def test_missing_api_key_coach_chat_throws_error(self):
        """Test that coach chat throws explicit error when API key is missing."""
        with patch.dict('os.environ', {}, clear=True):
            response = self.client.post('/api/v1/ai/coach-chat/', {
                'message': 'How should I train neck and shrugs safely at home?'
            }, format='json')
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(response.data['error_type'], 'API_KEY_MISSING')

    @patch('apps.ai.services.overload_engine.call_llm_api')
    def test_coach_chat_success_with_llm(self, mock_call_llm):
        """Test successful coach chat when LLM returns text."""
        mock_call_llm.return_value = 'Focus on strict 2-second eccentric control and 90s rest periods.'
        response = self.client.post('/api/v1/ai/coach-chat/', {
            'message': 'How do I optimize chest growth?'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('eccentric control', response.data['reply'])
