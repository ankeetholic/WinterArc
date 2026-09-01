import os
import re
import json
import urllib.request
import urllib.error
from datetime import date
from apps.workouts.models import Workout, WorkoutExercise, WorkoutSet
from apps.workouts.templates import AESTHETIC_FUTSAL_ROUTINES, HOME_TRAPS_NECK_ROUTINE

EXERCISE_BASELINE_RECOMMENDATIONS = {
    'incline db press': {'weight': 10.0, 'reps': '6-10', 'cue': '30° bench angle, 2-sec eccentric stretch on upper clavicular head.'},
    'incline dumbbell press': {'weight': 10.0, 'reps': '6-10', 'cue': '30° bench angle, 2-sec eccentric stretch on upper clavicular head.'},
    'flat machine press': {'weight': 25.0, 'reps': '8-12', 'cue': 'Retract scapulae, press smoothly through mid chest.'},
    'high-to-low cable fly': {'weight': 7.5, 'reps': '12-15', 'cue': 'Squeeze lower chest at bottom, control eccentric stretch.'},
    'overhead cable extension': {'weight': 10.0, 'reps': '10-15', 'cue': 'Deep stretch on long head behind head.'},
    'rope pushdown': {'weight': 12.5, 'reps': '10-15', 'cue': 'Flare rope at bottom for peak contraction.'},
    'cable crunch': {'weight': 20.0, 'reps': '10-15', 'cue': 'Flex spine, pull with abs not hips.'},
    'wide/neutral lat pulldown': {'weight': 25.0, 'reps': '8-12', 'cue': 'Drive elbows down and back, squeeze lats.'},
    'lat pulldown': {'weight': 25.0, 'reps': '8-12', 'cue': 'Drive elbows down and back, squeeze lats.'},
    'chest-supported row': {'weight': 10.0, 'reps': '8-12', 'cue': 'Dead stop at bottom for maximum back stretch.'},
    'straight-arm pulldown': {'weight': 12.5, 'reps': '12-15', 'cue': 'Keep arms straight, sweep bar to thighs using pure lats.'},
    'incline db curl': {'weight': 7.5, 'reps': '8-12', 'cue': 'Full elbow extension at bottom for long head stretch.'},
    'ez-bar preacher curl': {'weight': 15.0, 'reps': '10-15', 'cue': 'Pin triceps to pad, slow 2-sec descent.'},
    'hanging leg raise': {'weight': 0.0, 'reps': '8-15', 'cue': 'Roll pelvis upward, control swing.'},
    'standing dumbbell lateral raise': {'weight': 4.0, 'reps': '12-15', 'cue': 'Lead with elbows, strict tempo.'},
    'cable lateral raise': {'weight': 3.5, 'reps': '12-15', 'cue': 'Lead with elbows to isolate side delt.'},
    'reverse pec deck / rear delt fly': {'weight': 15.0, 'reps': '12-15', 'cue': 'Keep elbows high, squeeze rear delts.'},
    'face pull': {'weight': 15.0, 'reps': '12-15', 'cue': 'Pull to forehead with external rotation.'},
    'romanian deadlift': {'weight': 30.0, 'reps': '8-10', 'cue': 'Push hips backward for deep hamstring stretch.'},
    'leg press': {'weight': 50.0, 'reps': '10-12', 'cue': 'Deep knee flexion without pelvis rounding.'},
    'db / backpack shrugs': {'weight': 10.0, 'reps': '12-20', 'cue': '2-sec peak squeeze at top, no shoulder rolling.'},
    'farmer hold': {'weight': 12.0, 'reps': '30-60 sec', 'cue': 'Tall posture, chest up, strong grip.'},
    'neck flexion': {'weight': 1.25, 'reps': '15-20', 'cue': 'Slow controlled tempo, towel or light plate.'},
    'neck extension': {'weight': 1.25, 'reps': '15-20', 'cue': 'Controlled reps, never use ballistic force.'},
}

def analyze_exercise_history(user, exercise_name: str) -> dict:
    """
    Pulls past logged workout sets for an exercise name and computes volume metrics.
    """
    clean_name = exercise_name.strip().lower()
    
    past_exercises = WorkoutExercise.objects.filter(
        workout__user=user,
        exercise_name__icontains=clean_name
    ).select_related('workout').prefetch_related('sets').order_by('-workout__date', '-workout__created_at')

    if not past_exercises.exists():
        return {
            'has_history': False,
            'sessions_count': 0,
            'last_session_date': None,
            'completed_sets': [],
            'avg_weight': 0.0,
            'max_weight': 0.0,
            'avg_reps': 0,
            'total_volume': 0.0,
        }

    last_ex = past_exercises.first()
    completed_sets = [
        s for s in last_ex.sets.all()
        if s.completed and s.weight is not None and s.repetitions is not None
    ]

    if not completed_sets:
        return {
            'has_history': False,
            'sessions_count': past_exercises.count(),
            'last_session_date': str(last_ex.workout.date),
            'completed_sets': [],
            'avg_weight': 0.0,
            'max_weight': 0.0,
            'avg_reps': 0,
            'total_volume': 0.0,
        }

    weights = [float(s.weight) for s in completed_sets]
    reps = [s.repetitions for s in completed_sets]
    total_volume = sum(w * r for w, r in zip(weights, reps))
    avg_weight = round(sum(weights) / len(weights), 1)
    max_weight = max(weights)
    avg_reps = int(round(sum(reps) / len(reps)))

    return {
        'has_history': True,
        'sessions_count': past_exercises.count(),
        'last_session_date': str(last_ex.workout.date),
        'completed_sets': [
            {'set_number': s.set_number, 'weight': float(s.weight), 'repetitions': s.repetitions}
            for s in completed_sets
        ],
        'avg_weight': avg_weight,
        'max_weight': max_weight,
        'avg_reps': avg_reps,
        'total_volume': round(total_volume, 1),
    }

def get_user_training_history_summary(user) -> dict:
    """
    Summarizes the user's latest lifts across all exercises for real coaching context.
    """
    recent_workouts = Workout.objects.filter(user=user).prefetch_related('exercises__sets').order_by('-date', '-created_at')[:10]
    
    exercise_summary = {}
    for w in recent_workouts:
        for ex in w.exercises.all():
            name = ex.exercise_name
            if name not in exercise_summary:
                completed_sets = [s for s in ex.sets.all() if s.completed and s.weight is not None]
                if completed_sets:
                    weights = [float(s.weight) for s in completed_sets]
                    reps = [s.repetitions for s in completed_sets]
                    exercise_summary[name] = {
                        'last_date': str(w.date),
                        'last_workout': w.name,
                        'sets': [f"{s.weight}kg x {s.repetitions} reps" for s in completed_sets],
                        'avg_weight_kg': round(sum(weights) / len(weights), 1),
                        'max_weight_kg': max(weights),
                        'avg_reps': int(round(sum(reps) / len(reps))),
                    }

    return {
        'total_logged_workouts': recent_workouts.count(),
        'exercises_tracked': exercise_summary,
    }

def call_llm_api(system_prompt: str, user_prompt: str) -> str:
    """
    Directly calls Gemini API or OpenAI API.
    Raises ValueError / RuntimeError if no API key is provided or request fails.
    """
    gemini_key = os.environ.get('GEMINI_API_KEY', '').strip().strip('\'"')
    openai_key = os.environ.get('OPENAI_API_KEY', '').strip().strip('\'"')

    if not gemini_key and not openai_key:
        raise ValueError(
            "LLM API Key missing. Please configure GEMINI_API_KEY or OPENAI_API_KEY in your environment or .env file."
        )

    # 1. Try Gemini API if key is present
    if gemini_key:
        gemini_model = os.environ.get('GEMINI_MODEL', 'gemini-1.5-flash').strip().strip('\'"')
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={gemini_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"System Instructions:\n{system_prompt}\n\nUser Request:\n{user_prompt}"}
                        ]
                    }
                ]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode('utf-8'))
                candidates = result.get('candidates', [])
                if candidates:
                    parts = candidates[0].get('content', {}).get('parts', [])
                    if parts:
                        return parts[0].get('text', '')
                raise RuntimeError(f"Gemini API ({gemini_model}) returned an empty response.")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            raise RuntimeError(f"Gemini API ({gemini_model}) HTTP Error {e.code}: {err_body}")
        except urllib.error.URLError as e:
            raise RuntimeError(f"Gemini Network Connection Error: {e.reason}")
        except Exception as e:
            raise RuntimeError(f"Gemini LLM Call failed: {str(e)}")

    # 2. Try OpenAI API if key is present
    if openai_key:
        openai_model = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini').strip().strip('\'"')
        try:
            url = "https://api.openai.com/v1/chat/completions"
            payload = {
                "model": openai_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {openai_key}'
                }
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode('utf-8'))
                choices = result.get('choices', [])
                if choices:
                    return choices[0].get('message', {}).get('content', '')
                raise RuntimeError("OpenAI API returned an empty response.")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            raise RuntimeError(f"OpenAI API HTTP Error {e.code}: {err_body}")
        except urllib.error.URLError as e:
            raise RuntimeError(f"OpenAI Network Connection Error: {e.reason}")
        except Exception as e:
            raise RuntimeError(f"OpenAI LLM Call failed: {str(e)}")

    raise RuntimeError("Failed to invoke LLM.")

def calculate_progressive_overload(user, exercise_name: str, target_sets: int = 3, target_reps: str = '8-12') -> dict:
    """
    Computes precise, 100% deterministic progressive overload targets based on the user's logged database sets.
    """
    history = analyze_exercise_history(user, exercise_name)
    clean_name = exercise_name.strip().lower()

    # Parse target reps e.g. "8-12" -> min_reps=8, max_reps=12
    min_reps, max_reps = 8, 12
    rep_match = re.search(r'(\d+)\s*[-–]\s*(\d+)', target_reps)
    if rep_match:
        min_reps = int(rep_match.group(1))
        max_reps = int(rep_match.group(2))
    elif re.search(r'(\d+)', target_reps):
        min_reps = max_reps = int(re.search(r'(\d+)', target_reps).group(1))

    baseline_info = None
    for k, v in EXERCISE_BASELINE_RECOMMENDATIONS.items():
        if k in clean_name or clean_name in k:
            baseline_info = v
            break

    if not history['has_history']:
        default_weight = baseline_info['weight'] if baseline_info else 10.0
        coaching_tip = baseline_info['cue'] if baseline_info else "Perform working sets with strict form and 2-second eccentric phase."
        
        warmup_scheme = [
            {'set': 'Warmup 1', 'weight': round(default_weight * 0.5, 1), 'reps': 10, 'purpose': 'Joint priming'},
            {'set': 'Warmup 2', 'weight': round(default_weight * 0.75, 1), 'reps': 5, 'purpose': 'Acclimation'},
        ]

        return {
            'exercise_name': exercise_name,
            'status': 'BASELINE_ASSESSMENT',
            'action': 'ESTABLISH_BASELINE',
            'has_history': False,
            'suggested_weight': default_weight,
            'suggested_reps': f"{min_reps}-{max_reps}",
            'target_sets': target_sets,
            'progression_rule': f"Starting baseline: Perform {default_weight}kg for {min_reps}-{max_reps} reps with RPE 7-8.",
            'coaching_tip': coaching_tip,
            'warmup_scheme': warmup_scheme,
            'volume_projected_increase': 'Baseline Initial Target',
            'previous_performance': None,
        }

    # Apply pure Double Progression math:
    last_avg_w = history['avg_weight']
    last_avg_r = history['avg_reps']
    
    is_heavy_compound = any(w in clean_name for w in ['press', 'deadlift', 'squat', 'row', 'lat pulldown'])
    weight_step = 2.5 if is_heavy_compound else 1.25

    if last_avg_r >= max_reps:
        # HIT TOP OF REP BRACKET -> INCREASE WEIGHT
        suggested_weight = round(last_avg_w + weight_step, 1)
        suggested_reps = f"{min_reps}-{min_reps + 2}"
        action = "INCREASE_WEIGHT"
        progression_rule = f"Hit {max_reps} reps last session! Bump load by +{weight_step}kg to {suggested_weight}kg and aim for {min_reps} reps."
        projected_volume_change = f"+{round(((suggested_weight * min_reps * target_sets) - history['total_volume']) / (history['total_volume'] or 1) * 100, 1)}% Volume"
    elif last_avg_r >= min_reps:
        # INSIDE BRACKET -> ADD REPS
        suggested_weight = last_avg_w
        suggested_reps = f"{last_avg_r + 1}-{min(max_reps, last_avg_r + 2)}"
        action = "INCREASE_REPS"
        progression_rule = f"Hold {suggested_weight}kg and push for +1 to +2 extra reps per set to complete your rep window."
        projected_volume_change = "+5% to +10% Density"
    else:
        # BELOW TARGET -> CONSOLIDATE
        suggested_weight = last_avg_w
        suggested_reps = f"{min_reps}"
        action = "CONSOLIDATE_LOAD"
        progression_rule = f"Consolidate {suggested_weight}kg with strict 2-second negatives and full range of motion."
        projected_volume_change = "Form Consolidation"

    coaching_tip = baseline_info['cue'] if baseline_info else "Keep 1-2 reps in reserve (RPE 8-9) on working sets."

    warmup_scheme = [
        {'set': 'Warmup 1', 'weight': round(suggested_weight * 0.5, 1), 'reps': 10, 'purpose': 'Joint priming'},
        {'set': 'Warmup 2', 'weight': round(suggested_weight * 0.75, 1), 'reps': 5, 'purpose': 'Acclimation'},
        {'set': 'Warmup 3', 'weight': round(suggested_weight * 0.9, 1), 'reps': 2, 'purpose': 'Neural prep'},
    ]

    return {
        'exercise_name': exercise_name,
        'status': 'OVERLOAD_CALCULATED',
        'action': action,
        'has_history': True,
        'suggested_weight': suggested_weight,
        'suggested_reps': suggested_reps,
        'target_sets': target_sets,
        'progression_rule': progression_rule,
        'coaching_tip': coaching_tip,
        'warmup_scheme': warmup_scheme,
        'volume_projected_increase': projected_volume_change,
        'previous_performance': {
            'date': history['last_session_date'],
            'avg_weight': history['avg_weight'],
            'max_weight': history['max_weight'],
            'avg_reps': history['avg_reps'],
            'total_volume': history['total_volume'],
            'sets': history['completed_sets'],
        }
    }

def generate_ai_coach_reply(user, message: str, context: dict = None) -> dict:
    """
    Calls the LLM with the athlete's actual logged lift history AND today's exact prescribed schedule.
    """
    training_history = get_user_training_history_summary(user)
    
    # Calculate today's exact day of week and prescribed routine
    today = date.today()
    today_day_num = today.weekday() + 1 # 1: Monday ... 7: Sunday
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    current_day_name = day_names[today.weekday()]
    
    today_gym_routine = next((r for r in AESTHETIC_FUTSAL_ROUTINES if r['day_number'] == today_day_num), None)
    has_home_today = today_day_num in (2, 5) # Tuesday & Friday

    today_schedule_info = {
        'today_date': str(today),
        'day_of_week': current_day_name,
        'day_number': today_day_num,
        'gym_session': {
            'title': today_gym_routine['title'] if today_gym_routine else 'Rest Day',
            'focus': today_gym_routine['focus'] if today_gym_routine else 'Active Recovery',
            'abs_focus': today_gym_routine.get('abs_rotation') if today_gym_routine else 'Rest',
            'exercises': [
                {'name': ex['name'], 'focus': ex['focus'], 'sets': ex['target_sets'], 'reps': ex['target_reps']}
                for ex in (today_gym_routine['exercises'] if today_gym_routine else [])
            ]
        },
        'has_home_session_today': has_home_today,
        'home_session': {
            'title': HOME_TRAPS_NECK_ROUTINE['title'],
            'focus': HOME_TRAPS_NECK_ROUTINE['focus'],
            'exercises': [
                {'name': ex['name'], 'focus': ex['focus'], 'sets': ex['target_sets'], 'reps': ex['target_reps']}
                for ex in HOME_TRAPS_NECK_ROUTINE['exercises']
            ]
        } if has_home_today else None,
    }

    system_prompt = (
        "You are the athlete's dedicated personal Hypertrophy Coach for the Winter Arc consistency platform. "
        "CRITICAL INSTRUCTIONS:\n"
        f"1. TODAY IS: {current_day_name} ({today_schedule_info['gym_session']['title']}).\n"
        f"2. TODAY'S EXACT PRESCRIBED WORKOUT SCHEDULE:\n"
        f"{json.dumps(today_schedule_info, indent=2)}\n"
        "3. THE ATHLETE'S PAST WORKOUT LOGBOOK:\n"
        f"{json.dumps(training_history, indent=2)}\n"
        "4. WHEN ASKED 'what exercises do I have to do today?' or about today's workout:\n"
        f"   - You MUST state that today is {current_day_name}.\n"
        f"   - Recite the EXACT prescribed Gym exercises for today: {', '.join([ex['name'] for ex in (today_gym_routine['exercises'] if today_gym_routine else [])])}.\n"
        + (f"   - Also mention that today has a Session 2 Home Traps & Neck workout: {', '.join([ex['name'] for ex in HOME_TRAPS_NECK_ROUTINE['exercises']])}.\n" if has_home_today else "")
        + "   - NEVER list exercises from other days of the week!\n"
        "5. Keep the response SHORT, CLEAR, and DIRECT.\n"
        "6. DO NOT use markdown bold asterisks (do not use '**') and DO NOT use heading hashtags (no '###')."
    )

    user_prompt = f"Athlete Question:\n{message}"
    if context:
        user_prompt += f"\nActive Exercise Context: {json.dumps(context)}"

    llm_output = call_llm_api(system_prompt, user_prompt)

    # Clean any accidental residual markdown formatting
    cleaned_reply = re.sub(r'\*\*', '', llm_output)
    cleaned_reply = re.sub(r'#{1,6}\s*', '', cleaned_reply).strip()

    return {
        'reply': cleaned_reply,
        'recommendations': [
            "Start your prescribed gym session on the workout tab.",
            "Log your working weights and reps after each set."
        ]
    }
