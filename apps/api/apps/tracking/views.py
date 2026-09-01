from datetime import date
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import DailyLog
from .serializers import DailyLogSerializer

class DailyLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = DailyLog.objects.filter(
            goal__arc__user=self.request.user
        ).select_related('goal', 'goal__arc')

        date_param = self.request.query_params.get('date')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        goal_id = self.request.query_params.get('goal')
        arc_id = self.request.query_params.get('arc')

        if date_param:
            try:
                parsed_date = date.fromisoformat(date_param)
                queryset = queryset.filter(date=parsed_date)
            except ValueError:
                pass

        if start_date:
            try:
                parsed_start = date.fromisoformat(start_date)
                queryset = queryset.filter(date__gte=parsed_start)
            except ValueError:
                pass

        if end_date:
            try:
                parsed_end = date.fromisoformat(end_date)
                queryset = queryset.filter(date__lte=parsed_end)
            except ValueError:
                pass

        if goal_id:
            queryset = queryset.filter(goal_id=goal_id)

        if arc_id:
            queryset = queryset.filter(goal__arc_id=arc_id)

        return queryset
