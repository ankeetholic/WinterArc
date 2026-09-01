from datetime import date
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Goal
from .serializers import GoalSerializer, TodayGoalSerializer
from apps.arcs.models import Arc, ArcStatus
from apps.tracking.models import DailyLog

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Goal.objects.filter(arc__user=self.request.user)
        arc_id = self.request.query_params.get('arc')
        is_active = self.request.query_params.get('is_active')

        if arc_id:
            queryset = queryset.filter(arc_id=arc_id)
        if is_active is not None:
            if is_active.lower() in ('true', '1'):
                queryset = queryset.filter(is_active=True)
            elif is_active.lower() in ('false', '0'):
                queryset = queryset.filter(is_active=False)

        return queryset

    @action(detail=False, methods=['get'], url_path='today')
    def today(self, request):
        date_str = request.query_params.get('date')
        if date_str:
            try:
                target_date = date.fromisoformat(date_str)
            except ValueError:
                return Response({'detail': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            target_date = timezone.now().date()

        # Find active goals from active Arcs for the user
        goals = Goal.objects.filter(
            arc__user=request.user,
            arc__status=ArcStatus.ACTIVE,
            is_active=True
        ).select_related('arc')

        # Filter to goals active on this specific day of week (e.g. weekdays vs weekends)
        active_goals_today = [g for g in goals if g.is_active_on_date(target_date)]

        # Retrieve all daily logs for these goals on target_date
        daily_logs = {
            log.goal_id: log
            for log in DailyLog.objects.filter(goal__in=active_goals_today, date=target_date)
        }

        serialized_goals = []
        for goal in active_goals_today:
            log = daily_logs.get(goal.id)
            goal_data = GoalSerializer(goal, context={'request': request}).data
            goal_data['completed'] = log.completed if log else False
            goal_data['current_value'] = float(log.value) if (log and log.value is not None) else None
            goal_data['daily_log_id'] = str(log.id) if log else None
            goal_data['notes'] = log.notes if log else ''
            serialized_goals.append(goal_data)

        return Response({
            'date': str(target_date),
            'goals': serialized_goals
        }, status=status.HTTP_200_OK)
