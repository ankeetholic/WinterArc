import uuid
from django.db import models
from django.core.exceptions import ValidationError
from apps.arcs.models import Arc

class GoalCategory(models.TextChoices):
    HEALTH = 'HEALTH', 'Health'
    FITNESS = 'FITNESS', 'Fitness'
    CAREER = 'CAREER', 'Career'
    LEARNING = 'LEARNING', 'Learning'
    CODING = 'CODING', 'Coding'
    RESEARCH = 'RESEARCH', 'Research'
    PERSONAL = 'PERSONAL', 'Personal'
    OTHER = 'OTHER', 'Other'

class GoalFrequency(models.TextChoices):
    DAILY = 'DAILY', 'Daily'
    WEEKLY = 'WEEKLY', 'Weekly'

class Goal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    arc = models.ForeignKey(
        Arc,
        on_delete=models.CASCADE,
        related_name='goals',
        db_index=True
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    category = models.CharField(
        max_length=50,
        choices=GoalCategory.choices,
        default=GoalCategory.PERSONAL,
        db_index=True
    )
    target_value = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=1.00
    )
    unit = models.CharField(max_length=50, default='boolean')
    frequency = models.CharField(
        max_length=20,
        choices=GoalFrequency.choices,
        default=GoalFrequency.DAILY,
        db_index=True
    )
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveIntegerField(default=0, db_index=True)
    active_days = models.CharField(
        max_length=100,
        default='MON,TUE,WED,THU,FRI,SAT,SUN',
        help_text='Comma-separated days of week when this goal is active, e.g. MON,TUE,WED,THU,FRI'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'goals'
        verbose_name = 'Goal'
        verbose_name_plural = 'Goals'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['arc', 'is_active']),
            models.Index(fields=['arc', 'order']),
        ]

    def is_active_on_date(self, target_date):
        day_codes = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
        target_code = day_codes[target_date.weekday()]
        allowed_days = [d.strip().upper() for d in self.active_days.split(',') if d.strip()]
        return target_code in allowed_days

    def clean(self):
        super().clean()
        if self.target_value < 0:
            raise ValidationError({'target_value': 'Target value must be greater than or equal to 0.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.arc.name})"
