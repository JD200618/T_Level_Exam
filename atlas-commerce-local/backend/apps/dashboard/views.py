from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.views import APIView

from apps.common.responses import success_response

from .services import (
    build_admin_analytics,
    build_admin_overview,
    build_dashboard_summary,
    list_admin_customers,
    list_admin_inventory,
    list_admin_orders,
    update_admin_order_status,
    update_inventory_and_product,
)


class DashboardSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return success_response(data={'summary': build_dashboard_summary()}, message='Dashboard summary loaded')


class AdminOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return success_response(data={'overview': build_admin_overview()}, message='Admin overview loaded')


class AdminInventoryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return success_response(data={'inventory': list_admin_inventory()}, message='Inventory loaded')


class AdminInventoryDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, product_id):
        stock_level = request.data.get('stockLevel')
        price = request.data.get('price')
        inventory = update_inventory_and_product(
            product_id,
            stock_level=int(stock_level) if stock_level is not None else None,
            price=price,
            summary=request.data.get('summary'),
            producer_name=request.data.get('producerName'),
            producer_location=request.data.get('producerLocation'),
            production_method=request.data.get('productionMethod'),
            is_featured=request.data.get('isFeatured'),
        )
        if not inventory:
            return success_response(message='Product inventory not found', status_code=404)
        return success_response(data={'inventory': list_admin_inventory()}, message='Inventory updated')


class AdminOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return success_response(data={'orders': list_admin_orders()}, message='Admin orders loaded')


class AdminOrderStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, order_id):
        status = request.data.get('status', '').strip()
        if not status:
            return success_response(message='Status is required', status_code=400)
        order = update_admin_order_status(order_id, status)
        if not order:
            return success_response(message='Order not found', status_code=404)
        return success_response(data={'orders': list_admin_orders()}, message='Order status updated')


class AdminCustomersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return success_response(data={'customers': list_admin_customers()}, message='Admin customers loaded')


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return success_response(data={'analytics': build_admin_analytics()}, message='Admin analytics loaded')
