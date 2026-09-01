import os
import sys
from datetime import date, timedelta
from decimal import Decimal

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from apps.arcs.models import Arc
from apps.goals.models import Goal

User = get_user_model()
email = 'user@winterarc.com'
password = 'WinterArc2026!'

user, created = User.objects.get_or_create(
    email=email,
    defaults={
        'first_name': 'Aesthetic',
        'last_name': 'Athlete'
    }
)
user.set_password(password)
user.save()

today = date.today()
end_date = today + timedelta(days=90)

arc, _ = Arc.objects.get_or_create(
    user=user,
    status='ACTIVE',
    defaults={
        'name': 'Winter Arc 2026 — Daily Focus',
        'description': 'Minimal, high-discipline daily focus: 5:45 AM wake up, exam prep, AI coding, gym hypertrophy, and 9:45 PM sleep.',
        'start_date': today,
        'end_date': end_date
    }
)

ALL_DAYS = 'MON,TUE,WED,THU,FRI,SAT,SUN'
WEEKDAYS_ONLY = 'MON,TUE,WED,THU,FRI'

clean_timetable = [
    {
        'order': 1,
        'name': '🌅 Wake up (5:45 AM)',
        'category': 'HEALTH',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '5:45 AM • Wake up immediately without snoozing.'
    },
    {
        'order': 2,
        'name': '🛏️ Make bed & water',
        'category': 'HEALTH',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '5:45–5:55 AM • Make bed neatly and drink a full glass of water.'
    },
    {
        'order': 3,
        'name': '🪥 Brush, shower & shave',
        'category': 'HEALTH',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '5:55–6:15 AM • Brush teeth, shower, shaving and grooming.'
    },
    {
        'order': 4,
        'name': '🍳 Breakfast & oats',
        'category': 'HEALTH',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '6:15–6:30 AM • Oatmeal, eggs, and morning fuel.'
    },
    {
        'order': 5,
        'name': '🧠 Exam prep (Morning)',
        'category': 'LEARNING',
        'target_value': Decimal('1.75'),
        'unit': 'hours',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '6:30–8:15 AM • Engineering Council Exam morning study block.'
    },
    {
        'order': 6,
        'name': '☕ Morning break',
        'category': 'PERSONAL',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '8:15–8:30 AM • Coffee and quick mental recharge.'
    },
    {
        'order': 7,
        'name': '📝 MCQs & revision',
        'category': 'LEARNING',
        'target_value': Decimal('30'),
        'unit': 'minutes',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '8:30–9:00 AM • Practice MCQs and review mistake log.'
    },
    {
        'order': 8,
        'name': '🎒 Prep for school',
        'category': 'PERSONAL',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': WEEKDAYS_ONLY,
        'description': '9:00–9:20 AM • Get ready, dress, and pack school notes (Mon–Fri).'
    },
    {
        'order': 9,
        'name': '🍚 Pre-school meal',
        'category': 'HEALTH',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': WEEKDAYS_ONLY,
        'description': '9:20–9:35 AM • Rice, protein, and pre-class meal (Mon–Fri).'
    },
    {
        'order': 10,
        'name': '🎓 School classes',
        'category': 'CAREER',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': WEEKDAYS_ONLY,
        'description': '10:00–11:40 AM • Active attendance and lectures (Mon–Fri).'
    },
    {
        'order': 11,
        'name': '💻 Light work & rest',
        'category': 'PERSONAL',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': WEEKDAYS_ONLY,
        'description': '12:10–12:50 PM • Commute recovery and light tasks (Mon–Fri).'
    },
    {
        'order': 12,
        'name': '🍛 Lunch',
        'category': 'HEALTH',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '12:50–1:20 PM • Main high-protein meal.'
    },
    {
        'order': 13,
        'name': '💻 AI & coding research',
        'category': 'CODING',
        'target_value': Decimal('1.67'),
        'unit': 'hours',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '1:20–3:00 PM • Dedicated software engineering and AI work.'
    },
    {
        'order': 14,
        'name': '☕ Afternoon break',
        'category': 'PERSONAL',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '3:00–3:20 PM • Mid-afternoon tea/coffee recharge.'
    },
    {
        'order': 15,
        'name': '🧠 Quick MCQs revision',
        'category': 'LEARNING',
        'target_value': Decimal('25'),
        'unit': 'minutes',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '3:20–3:45 PM • Speed exam revision & practice test.'
    },
    {
        'order': 16,
        'name': '🍌 Pre-gym snack',
        'category': 'HEALTH',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '3:45–4:00 PM • Banana / oats pre-workout fuel.'
    },
    {
        'order': 17,
        'name': '🏋️ Gym workout',
        'category': 'FITNESS',
        'target_value': Decimal('2'),
        'unit': 'hours',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '4:00–6:00 PM • 6-Day Aesthetic + Futsal split session.'
    },
    {
        'order': 18,
        'name': '🚿 Post-gym shower',
        'category': 'HEALTH',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '6:00–6:30 PM • Post-workout hygiene and freshen up.'
    },
    {
        'order': 19,
        'name': '🍛 Dinner',
        'category': 'HEALTH',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '6:30–7:15 PM • High-protein dinner for recovery.'
    },
    {
        'order': 20,
        'name': '🧠 Exam prep (Evening)',
        'category': 'LEARNING',
        'target_value': Decimal('1'),
        'unit': 'hours',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '7:15–8:15 PM • Engineering Council evening study block.'
    },
    {
        'order': 21,
        'name': '📖 Flashcards & mistakes',
        'category': 'LEARNING',
        'target_value': Decimal('30'),
        'unit': 'minutes',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '8:15–8:45 PM • Review flashcards and error notes.'
    },
    {
        'order': 22,
        'name': '😌 Relax & pack bag',
        'category': 'PERSONAL',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '8:45–9:15 PM • Wind down and prep clothes/bag for tomorrow.'
    },
    {
        'order': 23,
        'name': '📋 Plan tomorrow',
        'category': 'PERSONAL',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '9:15–9:30 PM • Set tomorrow\'s priorities and schedule.'
    },
    {
        'order': 24,
        'name': '📵 Brush & phone away',
        'category': 'PERSONAL',
        'target_value': Decimal('1'),
        'unit': 'session',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '9:30–9:45 PM • Night brush and put phone away strictly by 9:30 PM.'
    },
    {
        'order': 25,
        'name': '😴 Sleep (9:45 PM)',
        'category': 'HEALTH',
        'target_value': Decimal('8'),
        'unit': 'hours',
        'frequency': 'DAILY',
        'active_days': ALL_DAYS,
        'description': '9:45 PM • In bed for 8 full hours of deep restorative sleep.'
    },
]

# Wipe old goals and re-seed
Goal.objects.filter(arc=arc).delete()

for t in clean_timetable:
    Goal.objects.create(
        arc=arc,
        name=t['name'],
        category=t['category'],
        target_value=t['target_value'],
        unit=t['unit'],
        frequency=t['frequency'],
        active_days=t['active_days'],
        description=t['description'],
        order=t['order'],
        is_active=True
    )

print(f"SUCCESS: Account '{email}' configured with weekday school schedule!")
