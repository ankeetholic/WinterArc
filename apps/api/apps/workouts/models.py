import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Workout(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workouts',
        db_index=True
    )
    name = models.CharField(max_length=255)
    day_number = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Day 1-7 in split")
    date = models.DateField(db_index=True)
    duration_minutes = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workouts'
        verbose_name = 'Workout'
        verbose_name_plural = 'Workouts'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f"{self.name} on {self.date} ({self.user.email})"

class WorkoutExercise(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workout = models.ForeignKey(
        Workout,
        on_delete=models.CASCADE,
        related_name='exercises',
        db_index=True
    )
    exercise_name = models.CharField(max_length=255)
    primary_focus = models.CharField(max_length=255, blank=True, default='')
    target_sets = models.PositiveIntegerField(default=3)
    target_reps = models.CharField(max_length=50, blank=True, default='8-12')
    order = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'workout_exercises'
        verbose_name = 'Workout Exercise'
        verbose_name_plural = 'Workout Exercises'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.exercise_name} ({self.workout.name})"

class WorkoutSet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workout_exercise = models.ForeignKey(
        WorkoutExercise,
        on_delete=models.CASCADE,
        related_name='sets',
        db_index=True
    )
    set_number = models.PositiveIntegerField(default=1)
    weight = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    repetitions = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    rpe = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workout_sets'
        verbose_name = 'Workout Set'
        verbose_name_plural = 'Workout Sets'
        ordering = ['set_number']

    def clean(self):
        super().clean()
        if self.weight < 0:
            raise ValidationError({'weight': 'Weight cannot be negative.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Set {self.set_number}: {self.weight}kg x {self.repetitions}"
