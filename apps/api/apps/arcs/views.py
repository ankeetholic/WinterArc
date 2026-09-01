from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Arc, ArcStatus
from .serializers import ArcSerializer

class ArcViewSet(viewsets.ModelViewSet):
    serializer_class = ArcSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Arc.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        active_arc = Arc.objects.filter(
            user=request.user,
            status=ArcStatus.ACTIVE
        ).order_by('-created_at').first()

        if not active_arc:
            return Response(
                {'detail': 'No active Arc found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(active_arc)
        return Response(serializer.data, status=status.HTTP_200_OK)
