from rest_framework import serializers
from .models import Workout, WorkoutExercise, WorkoutSet

class WorkoutSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutSet
        fields = (
            'id',
            'workout_exercise',
            'set_number',
            'weight',
            'repetitions',
            'completed',
            'rpe',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

class WorkoutExerciseSerializer(serializers.ModelSerializer):
    sets = WorkoutSetSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutExercise
        fields = (
            'id',
            'workout',
            'exercise_name',
            'primary_focus',
            'target_sets',
            'target_reps',
            'order',
            'notes',
            'sets',
            'created_at',
        )
        read_only_fields = ('id', 'created_at')

class WorkoutSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)
    total_sets = serializers.SerializerMethodField()
    total_volume = serializers.SerializerMethodField()

    class Meta:
        model = Workout
        fields = (
            'id',
            'name',
            'day_number',
            'date',
            'duration_minutes',
            'notes',
            'exercises',
            'total_sets',
            'total_volume',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_total_sets(self, obj):
        return WorkoutSet.objects.filter(workout_exercise__workout=obj, completed=True).count()

    def get_total_volume(self, obj):
        sets = WorkoutSet.objects.filter(workout_exercise__workout=obj, completed=True)
        return sum(float(s.weight) * s.repetitions for s in sets)
