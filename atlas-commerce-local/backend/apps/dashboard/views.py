from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.common.responses import success_response

from .services import build_dashboard_summary


class DashboardSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return success_response(data={'summary': build_dashboard_summary()}, message='Dashboard summary loaded')
