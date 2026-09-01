"""
Pre-configured Routine Templates for 6-Day Aesthetic + Futsal Program
Strictly mapped to weekly schedule:
- Monday (Day 1): Chest + Triceps (Upper Abs) [GYM]
- Tuesday (Day 2): Back + Biceps (Lower Abs) [GYM] + Traps & Neck [HOME]
- Wednesday (Day 3): Side & Rear Delts (Obliques) [GYM]
- Thursday (Day 4): Chest + Triceps (Upper Abs) [GYM]
- Friday (Day 5): Back + Biceps (Lower Abs) [GYM] + Traps & Neck [HOME]
- Saturday (Day 6): Legs + Side Delts (Obliques - Futsal & Athletic) [GYM]
- Sunday (Day 7): REST / RECOVERY
- Home Routine: Traps + Neck (Scheduled 2x/week on Tuesday & Friday)
"""

from datetime import date

HOME_TRAPS_NECK_ROUTINE = {
    'id': 'home-traps-neck',
    'day_number': 0,
    'day_name': 'Home Session',
    'title': 'Home Routine — Traps + Neck',
    'focus': 'Strong frame + neck hypertrophy (Start light with controlled reps)',
    'category': 'HOME',
    'schedule_note': 'Scheduled for Tuesday (Day 2) & Friday (Day 5)',
    'exercises': [
        {'name': 'DB / Backpack Shrugs', 'focus': 'Upper Traps', 'target_sets': 3, 'target_reps': '12-20'},
        {'name': 'Farmer Hold', 'focus': 'Traps + Grip', 'target_sets': 3, 'target_reps': '30-60 sec'},
        {'name': 'Neck Flexion', 'focus': 'Front Neck', 'target_sets': 2, 'target_reps': '15-20'},
        {'name': 'Neck Extension', 'focus': 'Rear Neck', 'target_sets': 2, 'target_reps': '15-20'},
        {'name': 'Lateral Neck Flexion', 'focus': 'Side Neck', 'target_sets': 2, 'target_reps': '15-20/side'},
    ]
}

AESTHETIC_FUTSAL_ROUTINES = [
    {
        'id': 'day-1',
        'day_number': 1,
        'day_name': 'Monday',
        'title': 'Monday (Day 1) — Chest + Triceps + Upper Abs',
        'focus': 'Upper chest + triceps + abdominal thickness',
        'category': 'GYM',
        'abs_rotation': 'Upper Abs',
        'homework_routine_id': None,
        'exercises': [
            {'name': 'Incline DB Press', 'focus': 'Upper Chest', 'target_sets': 4, 'target_reps': '6-10'},
            {'name': 'Flat Machine Press', 'focus': 'Chest / Mid Chest', 'target_sets': 3, 'target_reps': '8-12'},
            {'name': 'High-to-Low Cable Fly', 'focus': 'Lower / Overall Chest', 'target_sets': 3, 'target_reps': '12-15'},
            {'name': 'Overhead Cable Extension', 'focus': 'Triceps — Long Head', 'target_sets': 3, 'target_reps': '10-15'},
            {'name': 'Rope Pushdown', 'focus': 'Triceps — Lateral/Medial', 'target_sets': 3, 'target_reps': '10-15'},
            {'name': 'Cable Crunch', 'focus': 'Rectus Abdominis (Upper Abs)', 'target_sets': 3, 'target_reps': '10-15'},
        ]
    },
    {
        'id': 'day-2',
        'day_number': 2,
        'day_name': 'Tuesday',
        'title': 'Tuesday (Day 2) — Back + Biceps + Lower Abs',
        'focus': 'V-taper + back thickness + biceps',
        'category': 'GYM',
        'abs_rotation': 'Lower Abs',
        'homework_routine_id': 'home-traps-neck',
        'homework_title': 'Traps + Neck (Home Session)',
        'exercises': [
            {'name': 'Wide/Neutral Lat Pulldown', 'focus': 'Lat Width', 'target_sets': 4, 'target_reps': '8-12'},
            {'name': 'Chest-Supported Row', 'focus': 'Upper/Mid Back Thickness', 'target_sets': 4, 'target_reps': '8-12'},
            {'name': 'Straight-Arm Pulldown', 'focus': 'Lats / Lat Isolation', 'target_sets': 3, 'target_reps': '12-15'},
            {'name': 'Incline DB Curl', 'focus': 'Biceps', 'target_sets': 3, 'target_reps': '8-12'},
            {'name': 'EZ-Bar Preacher Curl', 'focus': 'Biceps', 'target_sets': 3, 'target_reps': '10-15'},
            {'name': 'Hanging Leg Raise', 'focus': 'Lower Abs / Core', 'target_sets': 3, 'target_reps': '8-15'},
        ]
    },
    {
        'id': 'day-3',
        'day_number': 3,
        'day_name': 'Wednesday',
        'title': 'Wednesday (Day 3) — Side & Rear Delts + Obliques',
        'focus': 'Shoulder width + 3D shoulders + core rotation',
        'category': 'GYM',
        'abs_rotation': 'Obliques',
        'homework_routine_id': None,
        'exercises': [
            {'name': 'Cable Lateral Raise', 'focus': 'Side Delts', 'target_sets': 4, 'target_reps': '12-20'},
            {'name': 'DB Lateral Raise', 'focus': 'Side Delts', 'target_sets': 3, 'target_reps': '12-20'},
            {'name': 'Reverse Pec Deck', 'focus': 'Rear Delts', 'target_sets': 4, 'target_reps': '12-20'},
            {'name': 'Face Pull', 'focus': 'Rear Delts / Upper Back', 'target_sets': 3, 'target_reps': '15-20'},
            {'name': 'Cable Woodchop', 'focus': 'Obliques / Core Rotation', 'target_sets': 3, 'target_reps': '10-15/side'},
        ]
    },
    {
        'id': 'day-4',
        'day_number': 4,
        'day_name': 'Thursday',
        'title': 'Thursday (Day 4) — Chest + Triceps + Upper Abs',
        'focus': 'Upper chest + chest thickness + arms',
        'category': 'GYM',
        'abs_rotation': 'Upper Abs',
        'homework_routine_id': None,
        'exercises': [
            {'name': 'Incline Smith Press', 'focus': 'Upper Chest', 'target_sets': 4, 'target_reps': '6-10'},
            {'name': 'Flat DB/Machine Press', 'focus': 'Mid / Overall Chest', 'target_sets': 3, 'target_reps': '8-12'},
            {'name': 'Weighted Dips', 'focus': 'Chest + Triceps', 'target_sets': 3, 'target_reps': '8-12'},
            {'name': 'EZ-Bar Skull Crushers', 'focus': 'Triceps — Long Head', 'target_sets': 3, 'target_reps': '8-12'},
            {'name': 'Cable Pushdown', 'focus': 'Triceps', 'target_sets': 3, 'target_reps': '10-15'},
            {'name': 'Weighted Decline Crunch', 'focus': 'Rectus Abdominis (Upper Abs)', 'target_sets': 3, 'target_reps': '10-15'},
        ]
    },
    {
        'id': 'day-5',
        'day_number': 5,
        'day_name': 'Friday',
        'title': 'Friday (Day 5) — Back + Biceps + Lower Abs',
        'focus': 'Lat width + back thickness + arm thickness',
        'category': 'GYM',
        'abs_rotation': 'Lower Abs',
        'homework_routine_id': 'home-traps-neck',
        'homework_title': 'Traps + Neck (Home Session)',
        'exercises': [
            {'name': 'T-Bar / Supported Row', 'focus': 'Upper Back Thickness', 'target_sets': 4, 'target_reps': '6-10'},
            {'name': 'Neutral-Grip Pulldown', 'focus': 'Lats / Width', 'target_sets': 3, 'target_reps': '8-12'},
            {'name': 'Single-Arm Lat Pulldown', 'focus': 'Lats / V-Taper', 'target_sets': 3, 'target_reps': '10-15'},
            {'name': 'DB Hammer Curl', 'focus': 'Brachialis / Biceps Thickness', 'target_sets': 3, 'target_reps': '8-12'},
            {'name': 'Reverse Cable Curl', 'focus': 'Forearms / Brachioradialis', 'target_sets': 3, 'target_reps': '12-15'},
            {'name': 'Reverse Crunch', 'focus': 'Lower Abs', 'target_sets': 3, 'target_reps': '10-15'},
        ]
    },
    {
        'id': 'day-6',
        'day_number': 6,
        'day_name': 'Saturday',
        'title': 'Saturday (Day 6) — Legs + Side Delts + Obliques',
        'focus': 'Athletic legs + shoulder width for Futsal & athletic performance',
        'category': 'FUTSAL_ATHLETIC',
        'abs_rotation': 'Obliques',
        'homework_routine_id': None,
        'exercises': [
            {'name': 'Bulgarian Split Squat', 'focus': 'Quads + Glutes', 'target_sets': 3, 'target_reps': '8-10/leg'},
            {'name': 'Romanian Deadlift', 'focus': 'Hamstrings + Glutes', 'target_sets': 3, 'target_reps': '8-10'},
            {'name': 'Leg Curl', 'focus': 'Hamstrings', 'target_sets': 3, 'target_reps': '10-15'},
            {'name': 'Standing Calf Raise', 'focus': 'Calves', 'target_sets': 4, 'target_reps': '12-15'},
            {'name': 'Cable/DB Lateral Raise', 'focus': 'Side Delts', 'target_sets': 4, 'target_reps': '12-20'},
            {'name': 'Pallof Press', 'focus': 'Obliques / Core Stability', 'target_sets': 3, 'target_reps': '10-15/side'},
        ]
    },
    {
        'id': 'day-7',
        'day_number': 7,
        'day_name': 'Sunday',
        'title': 'Sunday (Day 7) — Rest & Active Recovery',
        'focus': 'Muscular recovery, central nervous system rejuvenation, mobility',
        'category': 'REST',
        'abs_rotation': 'Rest',
        'homework_routine_id': None,
        'exercises': [
            {'name': 'Full-Body Mobility & Foam Rolling', 'focus': 'Tissue Quality & Flexibility', 'target_sets': 1, 'target_reps': '15-20 mins'},
            {'name': 'Light Walking / Zone 2 Recovery', 'focus': 'Active Blood Flow & Recovery', 'target_sets': 1, 'target_reps': '20-30 mins'},
        ]
    },
    HOME_TRAPS_NECK_ROUTINE
]

def get_routine_by_day(target_date: date):
    weekday = target_date.isoweekday()
    routine_id = f'day-{weekday}'
    gym_routine = next((r for r in AESTHETIC_FUTSAL_ROUTINES if r['id'] == routine_id), None)
    home_routine = HOME_TRAPS_NECK_ROUTINE if weekday in [2, 5] else None
    return gym_routine, home_routine
