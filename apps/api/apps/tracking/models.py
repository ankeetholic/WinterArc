import uuid
from django.db import models
from django.core.exceptions import ValidationError
from apps.goals.models import Goal

class DailyLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name='daily_logs',
        db_index=True
    )
    date = models.DateField(db_index=True)
    completed = models.BooleanField(default=False, db_index=True)
    value = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'daily_logs'
        verbose_name = 'Daily Log'
        verbose_name_plural = 'Daily Logs'
        ordering = ['-date', '-created_at']
        constraints = [
            models.UniqueConstraint(fields=['goal', 'date'], name='unique_goal_date')
        ]
        indexes = [
            models.Index(fields=['goal', 'date']),
            models.Index(fields=['date', 'completed']),
        ]

    def clean(self):
        super().clean()
        if self.value is not None and self.value < 0:
            raise ValidationError({'value': 'Value must be greater than or equal to 0.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.goal.name} on {self.date} (completed={self.completed})"
