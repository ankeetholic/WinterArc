from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.arcs.models import Arc, ArcStatus
from apps.arcs.serializers import ArcSerializer
from apps.goals.models import Goal
from apps.goals.serializers import GoalSerializer
from apps.tracking.models import DailyLog
from apps.tracking.serializers import DailyLogSerializer

from .services.scoring import calculate_daily_score
from .services.streaks import calculate_streaks
from .services.heatmap import generate_heatmap_data

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # Active Arc
        active_arc = Arc.objects.filter(user=user, status=ArcStatus.ACTIVE).order_by('-created_at').first()
        arc_data = None
        if active_arc:
            arc_data = ArcSerializer(active_arc).data
            # Calculate Arc progress percentage based on dates
            total_days = max(1, (active_arc.end_date - active_arc.start_date).days + 1)
            days_passed = max(0, min(total_days, (today - active_arc.start_date).days + 1))
            arc_data['progress_percentage'] = int(round((days_passed / total_days) * 100))
            arc_data['day_number'] = days_passed
            arc_data['total_days'] = total_days

        # Today's daily score
        today_score = calculate_daily_score(user, today)

        # Streaks
        streak_data = calculate_streaks(user)

        # Today's goals
        goals_qs = Goal.objects.filter(
            arc__user=user,
            arc__status=ArcStatus.ACTIVE,
            is_active=True
        )
        today_logs = {
            log.goal_id: log
            for log in DailyLog.objects.filter(goal__in=goals_qs, date=today)
        }
        goals_data = []
        for g in goals_qs:
            log = today_logs.get(g.id)
            g_data = GoalSerializer(g).data
            g_data['completed'] = log.completed if log else False
            g_data['current_value'] = float(log.value) if (log and log.value is not None) else None
            g_data['daily_log_id'] = str(log.id) if log else None
            g_data['notes'] = log.notes if log else ''
            goals_data.append(g_data)

        # Recent activity (last 5 logs)
        recent_logs = DailyLog.objects.filter(
            goal__arc__user=user
        ).select_related('goal').order_by('-date', '-created_at')[:5]
        recent_activity_data = DailyLogSerializer(recent_logs, many=True).data

        return Response({
            'arc': arc_data,
            'today': today_score,
            'streak': streak_data,
            'goals': goals_data,
            'recent_activity': recent_activity_data,
        }, status=status.HTTP_200_OK)

class DailyScoreView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get('date')
        if date_str:
            try:
                target_date = date.fromisoformat(date_str)
            except ValueError:
                return Response({'detail': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            target_date = timezone.now().date()

        score_data = calculate_daily_score(request.user, target_date)
        return Response(score_data, status=status.HTTP_200_OK)

class StreakView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        streak_data = calculate_streaks(request.user)
        return Response(streak_data, status=status.HTTP_200_OK)

class HeatmapView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        start_date = None
        end_date = None

        if start_date_str:
            try:
                start_date = date.fromisoformat(start_date_str)
            except ValueError:
                return Response({'detail': 'Invalid start_date. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        if end_date_str:
            try:
                end_date = date.fromisoformat(end_date_str)
            except ValueError:
                return Response({'detail': 'Invalid end_date. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        heatmap_data = generate_heatmap_data(request.user, start_date=start_date, end_date=end_date)
        return Response(heatmap_data, status=status.HTTP_200_OK)

class WeeklyAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        week_start_str = request.query_params.get('week_start')
        if week_start_str:
            try:
                week_start = date.fromisoformat(week_start_str)
            except ValueError:
                return Response({'detail': 'Invalid week_start format.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            today = timezone.now().date()
            # Start on Monday of current week
            week_start = today - timedelta(days=today.weekday())

        week_end = week_start + timedelta(days=6)

        active_goals = Goal.objects.filter(
            arc__user=request.user,
            arc__status=ArcStatus.ACTIVE,
            is_active=True
        )
        total_possible = active_goals.count() * 7

        completed_count = DailyLog.objects.filter(
            goal__in=active_goals,
            date__gte=week_start,
            date__lte=week_end,
            completed=True
        ).count()

        rate = round(completed_count / total_possible, 2) if total_possible > 0 else 0.0
        percentage = int(round(rate * 100))

        return Response({
            'week_start': str(week_start),
            'week_end': str(week_end),
            'completion_rate': rate,
            'percentage': percentage,
            'completed_goals': completed_count,
            'total_goals': total_possible,
        }, status=status.HTTP_200_OK)

class MonthlyAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        year = int(request.query_params.get('year', today.year))
        month = int(request.query_params.get('month', today.month))

        import calendar
        _, num_days = calendar.monthrange(year, month)
        month_start = date(year, month, 1)
        month_end = date(year, month, num_days)

        active_goals = Goal.objects.filter(
            arc__user=request.user,
            arc__status=ArcStatus.ACTIVE,
            is_active=True
        )
        total_possible = active_goals.count() * num_days

        completed_count = DailyLog.objects.filter(
            goal__in=active_goals,
            date__gte=month_start,
            date__lte=month_end,
            completed=True
        ).count()

        rate = round(completed_count / total_possible, 2) if total_possible > 0 else 0.0
        percentage = int(round(rate * 100))

        return Response({
            'year': year,
            'month': month,
            'completion_rate': rate,
            'percentage': percentage,
            'completed_goals': completed_count,
            'total_goals': total_possible,
        }, status=status.HTTP_200_OK)

class GoalAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        goals = Goal.objects.filter(arc__user=user, is_active=True).select_related('arc')
        
        goal_stats = []
        for g in goals:
            total_logs = DailyLog.objects.filter(goal=g).count()
            completed_logs = DailyLog.objects.filter(goal=g, completed=True).count()
            rate = round(completed_logs / total_logs, 2) if total_logs > 0 else 0.0
            percentage = int(round(rate * 100))
            goal_stats.append({
                'goal_id': str(g.id),
                'name': g.name,
                'category': g.category,
                'unit': g.unit,
                'target_value': float(g.target_value),
                'total_logged': total_logs,
                'completed_logged': completed_logs,
                'completion_rate': rate,
                'percentage': percentage,
            })

        return Response({'goals': goal_stats}, status=status.HTTP_200_OK)
