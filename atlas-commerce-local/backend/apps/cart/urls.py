from django.urls import path

from .views import CartDetailView, CartItemCreateView, CartItemUpdateView

urlpatterns = [
    path('', CartDetailView.as_view(), name='cart-detail'),
    path('items/', CartItemCreateView.as_view(), name='cart-items-create'),
    path('items/<int:item_lookup>/', CartItemUpdateView.as_view(), name='cart-items-update'),
]
