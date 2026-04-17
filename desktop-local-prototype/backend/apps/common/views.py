from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    def get(self, request):
        return Response({
            'ok': True,
            'service': 'desktop-local-django-prototype',
            'message': 'Backend scaffold is up',
        })
