from datetime import date
from django.utils import timezone
from apps.goals.models import Goal
from apps.arcs.models import Arc, ArcStatus
from apps.tracking.models import DailyLog

def calculate_daily_score(user, target_date: date) -> dict:
    """
    Calculates the completion score for a user on a given date.
    Finds active goals for the user's active arc(s) on target_date,
    checks daily logs, and returns the score metrics.
    """
    # Active goals belonging to user's active arcs
    all_goals = Goal.objects.filter(
        arc__user=user,
        arc__status=ArcStatus.ACTIVE,
        is_active=True
    )
    goals = [g for g in all_goals if g.is_active_on_date(target_date)]
    total = len(goals)

    if total == 0:
        return {
            'date': str(target_date),
            'completed': 0,
            'total': 0,
            'score': 0.0,
            'percentage': 0,
        }

    goal_ids = [g.id for g in goals]
    completed_count = DailyLog.objects.filter(
        goal_id__in=goal_ids,
        date=target_date,
        completed=True
    ).count()

    score = round(completed_count / total, 2)
    percentage = int(round((completed_count / total) * 100))

    return {
        'date': str(target_date),
        'completed': completed_count,
        'total': total,
        'score': score,
        'percentage': percentage,
    }
