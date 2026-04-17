from django.urls import path

from .views import CheckoutPlaceView, CheckoutPreviewView, OrderListView

urlpatterns = [
    path('', OrderListView.as_view(), name='orders-list'),
    path('checkout/preview/', CheckoutPreviewView.as_view(), name='orders-checkout-preview'),
    path('checkout/place/', CheckoutPlaceView.as_view(), name='orders-checkout-place'),
]
