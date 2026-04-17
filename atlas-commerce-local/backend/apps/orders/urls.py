from django.urls import path

from .views import CheckoutPlaceView, CheckoutPreviewView, OrderDetailView, OrderListView

urlpatterns = [
    path('', OrderListView.as_view(), name='orders-list'),
    path('<int:order_id>/', OrderDetailView.as_view(), name='orders-detail'),
    path('checkout/preview/', CheckoutPreviewView.as_view(), name='orders-checkout-preview'),
    path('checkout/place/', CheckoutPlaceView.as_view(), name='orders-checkout-place'),
]
