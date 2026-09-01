from datetime import date
from django.utils import timezone
from django.db.models import Max, Prefetch
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Workout, WorkoutExercise, WorkoutSet
from .serializers import WorkoutSerializer, WorkoutExerciseSerializer, WorkoutSetSerializer
from .templates import AESTHETIC_FUTSAL_ROUTINES

class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Workout.objects.filter(user=self.request.user).prefetch_related(
            Prefetch(
                'exercises',
                queryset=WorkoutExercise.objects.prefetch_related('sets').order_by('order', 'created_at')
            )
        )
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if start_date:
            try:
                queryset = queryset.filter(date__gte=date.fromisoformat(start_date))
            except ValueError:
                pass

        if end_date:
            try:
                queryset = queryset.filter(date__lte=date.fromisoformat(end_date))
            except ValueError:
                pass

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='templates')
    def templates(self, request):
        return Response({'routines': AESTHETIC_FUTSAL_ROUTINES}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='today-routine')
    def today_routine(self, request):
        date_str = request.query_params.get('date')
        try:
            target_date = date.fromisoformat(date_str) if date_str else timezone.now().date()
        except ValueError:
            target_date = timezone.now().date()

        from .templates import get_routine_by_day
        gym_routine, home_routine = get_routine_by_day(target_date)
        return Response({
            'date': str(target_date),
            'weekday': target_date.isoweekday(),
            'routine': gym_routine,
            'gym_routine': gym_routine,
            'home_routine': home_routine
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='start-template')
    def start_template(self, request):
        template_id = request.data.get('template_id')
        date_str = request.data.get('date')

        if not template_id:
            return Response({'detail': 'template_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        routine = next((r for r in AESTHETIC_FUTSAL_ROUTINES if r['id'] == template_id), None)
        if not routine:
            return Response({'detail': f'Template with id "{template_id}" not found.'}, status=status.HTTP_404_NOT_FOUND)

        target_date = date.fromisoformat(date_str) if date_str else timezone.now().date()

        workout = Workout.objects.create(
            user=request.user,
            name=routine['title'],
            day_number=routine.get('day_number'),
            date=target_date,
            notes=f"Focus: {routine.get('focus', '')}"
        )

        # Prepopulate exercises and initial sets
        for idx, ex_data in enumerate(routine['exercises']):
            ex = WorkoutExercise.objects.create(
                workout=workout,
                exercise_name=ex_data['name'],
                primary_focus=ex_data.get('focus', ''),
                target_sets=ex_data.get('target_sets', 3),
                target_reps=ex_data.get('target_reps', '8-12'),
                order=idx
            )
            # Create initial placeholder sets
            for s_num in range(1, ex.target_sets + 1):
                WorkoutSet.objects.create(
                    workout_exercise=ex,
                    set_number=s_num,
                    weight=0.00,
                    repetitions=0,
                    completed=False
                )

        serializer = self.get_serializer(workout)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='log-set')
    def log_set(self, request, pk=None):
        workout = self.get_object()
        exercise_id = request.data.get('exercise_id')
        set_number = request.data.get('set_number', 1)
        weight = request.data.get('weight', 0)
        repetitions = request.data.get('repetitions', 0)
        completed = request.data.get('completed', True)
        rpe = request.data.get('rpe')

        exercise = WorkoutExercise.objects.filter(workout=workout, id=exercise_id).first()
        if not exercise:
            return Response({'detail': 'Exercise not found in this workout.'}, status=status.HTTP_404_NOT_FOUND)

        set_obj, _ = WorkoutSet.objects.get_or_create(
            workout_exercise=exercise,
            set_number=set_number
        )
        set_obj.weight = weight
        set_obj.repetitions = repetitions
        set_obj.completed = completed
        if rpe is not None:
            set_obj.rpe = rpe
        set_obj.save()

        return Response(WorkoutSetSerializer(set_obj).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='add-exercise')
    def add_exercise(self, request, pk=None):
        workout = self.get_object()
        exercise_name = request.data.get('exercise_name', '').strip()
        primary_focus = request.data.get('primary_focus', '').strip()
        target_sets = int(request.data.get('target_sets', 3))
        target_reps = request.data.get('target_reps', '8-12')

        if not exercise_name:
            return Response({'detail': 'exercise_name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        order = workout.exercises.count()
        ex = WorkoutExercise.objects.create(
            workout=workout,
            exercise_name=exercise_name,
            primary_focus=primary_focus,
            target_sets=target_sets,
            target_reps=target_reps,
            order=order
        )

        for s_num in range(1, target_sets + 1):
            WorkoutSet.objects.create(
                workout_exercise=ex,
                set_number=s_num,
                weight=0.00,
                repetitions=0,
                completed=False
            )

        return Response(WorkoutExerciseSerializer(ex).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='prs')
    def personal_records(self, request):
        user_workouts = Workout.objects.filter(user=request.user)
        sets = WorkoutSet.objects.filter(
            workout_exercise__workout__in=user_workouts,
            completed=True
        ).select_related('workout_exercise')

        prs: dict[str, dict] = {}
        for s in sets:
            name = s.workout_exercise.exercise_name
            w = float(s.weight)
            r = s.repetitions
            if name not in prs or w > prs[name]['max_weight'] or (w == prs[name]['max_weight'] and r > prs[name]['max_reps']):
                prs[name] = {
                    'exercise_name': name,
                    'max_weight': w,
                    'max_reps': r,
                    'date': str(s.workout_exercise.workout.date)
                }

        return Response({'prs': list(prs.values())}, status=status.HTTP_200_OK)
