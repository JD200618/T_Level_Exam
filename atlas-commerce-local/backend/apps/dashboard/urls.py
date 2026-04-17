from django.urls import path

from .views import (
    AdminAnalyticsView,
    AdminCustomersView,
    AdminInventoryDetailView,
    AdminInventoryView,
    AdminOrderStatusView,
    AdminOrdersView,
    AdminOverviewView,
    DashboardSummaryView,
)

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('admin/overview/', AdminOverviewView.as_view(), name='dashboard-admin-overview'),
    path('admin/inventory/', AdminInventoryView.as_view(), name='dashboard-admin-inventory'),
    path('admin/inventory/<int:product_id>/', AdminInventoryDetailView.as_view(), name='dashboard-admin-inventory-detail'),
    path('admin/orders/', AdminOrdersView.as_view(), name='dashboard-admin-orders'),
    path('admin/orders/<int:order_id>/status/', AdminOrderStatusView.as_view(), name='dashboard-admin-order-status'),
    path('admin/customers/', AdminCustomersView.as_view(), name='dashboard-admin-customers'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='dashboard-admin-analytics'),
]
