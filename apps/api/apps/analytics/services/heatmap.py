from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Count
from apps.goals.models import Goal
from apps.arcs.models import Arc, ArcStatus
from apps.tracking.models import DailyLog

def generate_heatmap_data(user, start_date: date = None, end_date: date = None) -> dict:
    """
    Generates heatmap consistency data across a date range.
    """
    active_arc = Arc.objects.filter(user=user, status=ArcStatus.ACTIVE).order_by('-created_at').first()

    today = timezone.now().date()
    if not end_date:
        end_date = today
    if not start_date:
        if active_arc and active_arc.start_date:
            start_date = active_arc.start_date
        else:
            start_date = end_date - timedelta(days=90)

    # Ensure start_date <= end_date
    if start_date > end_date:
        start_date, end_date = end_date, start_date

    active_goals = list(Goal.objects.filter(
        arc__user=user,
        arc__status=ArcStatus.ACTIVE,
        is_active=True
    ))

    # Query completed logs grouped by date in range
    logs_by_date = {
        item['date']: item['count']
        for item in DailyLog.objects.filter(
            goal__in=active_goals,
            date__gte=start_date,
            date__lte=end_date,
            completed=True
        ).values('date').annotate(count=Count('id'))
    }

    days = []
    curr = start_date
    while curr <= end_date:
        day_goals = [g for g in active_goals if g.is_active_on_date(curr)]
        total_for_day = len(day_goals)
        completed = logs_by_date.get(curr, 0)
        score = round(completed / total_for_day, 2) if total_for_day > 0 else 0.0
        percentage = int(round((completed / total_for_day) * 100)) if total_for_day > 0 else 0
        days.append({
            'date': str(curr),
            'score': score,
            'percentage': percentage,
            'completed': completed,
            'total': total_for_day,
        })
        curr += timedelta(days=1)

    return {
        'start_date': str(start_date),
        'end_date': str(end_date),
        'days': days
    }
