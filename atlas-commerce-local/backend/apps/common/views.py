from rest_framework.views import APIView

from .responses import success_response


class HealthView(APIView):
    def get(self, request):
        return success_response(
            data={
                'service': 'desktop-local-django-prototype',
                'mode': 'canonical-local-backend',
            },
            message='Backend health check passed',
        )
