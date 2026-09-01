from rest_framework import serializers
from .models import Goal, GoalCategory, GoalFrequency
from apps.arcs.models import Arc

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = (
            'id',
            'arc',
            'name',
            'description',
            'category',
            'target_value',
            'unit',
            'frequency',
            'is_active',
            'order',
            'active_days',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_arc(self, value):
        request = self.context.get('request')
        if request and value.user != request.user:
            raise serializers.ValidationError("You do not own this Arc.")
        return value

    def validate_target_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Target value must be greater than or equal to 0.")
        return value

class TodayGoalSerializer(serializers.ModelSerializer):
    completed = serializers.BooleanField(default=False)
    current_value = serializers.DecimalField(max_digits=8, decimal_places=2, allow_null=True, default=None)
    daily_log_id = serializers.UUIDField(allow_null=True, default=None)
    notes = serializers.CharField(allow_blank=True, default='')

    class Meta:
        model = Goal
        fields = (
            'id',
            'arc',
            'name',
            'description',
            'category',
            'target_value',
            'unit',
            'frequency',
            'is_active',
            'order',
            'active_days',
            'completed',
            'current_value',
            'daily_log_id',
            'notes',
        )
