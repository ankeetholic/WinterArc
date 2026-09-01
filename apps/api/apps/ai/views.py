from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .services.overload_engine import calculate_progressive_overload, generate_ai_coach_reply

class ProgressiveOverloadAdviceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        exercise_name = request.data.get('exercise_name')
        if not exercise_name or not exercise_name.strip():
            return Response(
                {'detail': 'exercise_name is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_sets = int(request.data.get('target_sets', 3))
        target_reps = str(request.data.get('target_reps', '8-12'))

        try:
            advice = calculate_progressive_overload(
                user=request.user,
                exercise_name=exercise_name.strip(),
                target_sets=target_sets,
                target_reps=target_reps
            )
            return Response(advice, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'detail': str(e), 'error_type': 'API_KEY_MISSING'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except RuntimeError as e:
            return Response(
                {'detail': str(e), 'error_type': 'LLM_REQUEST_FAILED'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {'detail': f'Internal AI processing error: {str(e)}', 'error_type': 'UNKNOWN_ERROR'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AICoachChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        if not message or not message.strip():
            return Response(
                {'detail': 'message is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        context = request.data.get('context', {})
        try:
            response_data = generate_ai_coach_reply(
                user=request.user,
                message=message.strip(),
                context=context
            )
            return Response(response_data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'detail': str(e), 'error_type': 'API_KEY_MISSING'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except RuntimeError as e:
            return Response(
                {'detail': str(e), 'error_type': 'LLM_REQUEST_FAILED'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {'detail': f'Internal AI processing error: {str(e)}', 'error_type': 'UNKNOWN_ERROR'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
