from rest_framework import serializers
from .models import DailyLog
from apps.goals.models import Goal

class DailyLogSerializer(serializers.ModelSerializer):
    goal_name = serializers.CharField(source='goal.name', read_only=True)
    unit = serializers.CharField(source='goal.unit', read_only=True)
    target_value = serializers.DecimalField(source='goal.target_value', max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = DailyLog
        fields = (
            'id',
            'goal',
            'goal_name',
            'unit',
            'target_value',
            'date',
            'completed',
            'value',
            'notes',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_goal(self, value):
        request = self.context.get('request')
        if request and value.arc.user != request.user:
            raise serializers.ValidationError("You do not own this Goal.")
        return value

    def validate_value(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Value must be greater than or equal to 0.")
        return value

    def validate(self, attrs):
        # Check uniqueness on create/update
        goal = attrs.get('goal', getattr(self.instance, 'goal', None))
        log_date = attrs.get('date', getattr(self.instance, 'date', None))
        
        if goal and log_date:
            qs = DailyLog.objects.filter(goal=goal, date=log_date)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({
                    'detail': f"A daily log already exists for goal '{goal.name}' on {log_date}."
                })

        # Automatically determine completion if value is provided and completed wasn't explicitly set
        value = attrs.get('value')
        completed = attrs.get('completed')
        if goal and value is not None and completed is None:
            if value >= goal.target_value:
                attrs['completed'] = True

        return attrs
