from rest_framework import serializers
from .models import Arc, ArcStatus

class ArcSerializer(serializers.ModelSerializer):
    class Meta:
        model = Arc
        fields = (
            'id',
            'name',
            'description',
            'start_date',
            'end_date',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, attrs):
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be on or after start date.'
            })
        return attrs
