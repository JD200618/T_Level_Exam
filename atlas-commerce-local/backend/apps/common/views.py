from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.views import APIView

from .responses import success_response


@method_decorator(ensure_csrf_cookie, name='dispatch')
class HealthView(APIView):
    def get(self, request):
        return success_response(
            data={
                'service': 'desktop-local-django-prototype',
                'mode': 'canonical-local-backend',
            },
            message='Backend health check passed',
        )
