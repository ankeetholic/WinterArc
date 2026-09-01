from datetime import date, timedelta
from django.utils import timezone
from apps.goals.models import Goal
from apps.arcs.models import ArcStatus
from apps.tracking.models import DailyLog

def calculate_streaks(user) -> dict:
    """
    Calculates current streak and best streak for a user.
    A day is considered successful if all active goals for that day were completed (and total > 0).
    """
    active_goals = Goal.objects.filter(
        arc__user=user,
        arc__status=ArcStatus.ACTIVE,
        is_active=True
    )
    total_goals = active_goals.count()

    if total_goals == 0:
        return {'current_streak': 0, 'best_streak': 0}

    # Retrieve all completed logs for the user's active goals
    completed_logs = DailyLog.objects.filter(
        goal__in=active_goals,
        completed=True
    ).values('date').distinct()

    if not completed_logs.exists():
        return {'current_streak': 0, 'best_streak': 0}

    # Group completed logs by date and check which dates had 100% completion
    from django.db.models import Count
    successful_dates = set(
        DailyLog.objects.filter(
            goal__in=active_goals,
            completed=True
        ).values('date')
        .annotate(completed_count=Count('id'))
        .filter(completed_count__gte=total_goals)
        .values_list('date', flat=True)
    )

    if not successful_dates:
        return {'current_streak': 0, 'best_streak': 0}

    sorted_dates = sorted(successful_dates)

    # Calculate best streak across all history
    best_streak = 0
    temp_streak = 0
    prev_date = None

    for d in sorted_dates:
        if prev_date is None:
            temp_streak = 1
        elif d == prev_date + timedelta(days=1):
            temp_streak += 1
        else:
            temp_streak = 1
        prev_date = d
        if temp_streak > best_streak:
            best_streak = temp_streak

    # Calculate current streak
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    current_streak = 0

    check_date = today if today in successful_dates else yesterday

    while check_date in successful_dates:
        current_streak += 1
        check_date = check_date - timedelta(days=1)

    return {
        'current_streak': current_streak,
        'best_streak': max(best_streak, current_streak)
    }
