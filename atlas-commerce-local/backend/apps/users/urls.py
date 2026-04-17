from django.urls import path

from .views import (
    AddressDetailView,
    AddressListCreateView,
    CurrentUserView,
    LoginView,
    LogoutView,
    PaymentMethodDetailView,
    PaymentMethodListCreateView,
    ProfileView,
)

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='users-me'),
    path('login/', LoginView.as_view(), name='users-login'),
    path('logout/', LogoutView.as_view(), name='users-logout'),
    path('profile/', ProfileView.as_view(), name='users-profile'),
    path('addresses/', AddressListCreateView.as_view(), name='users-addresses'),
    path('addresses/<int:address_id>/', AddressDetailView.as_view(), name='users-address-detail'),
    path('payment-methods/', PaymentMethodListCreateView.as_view(), name='users-payment-methods'),
    path('payment-methods/<int:payment_method_id>/', PaymentMethodDetailView.as_view(), name='users-payment-method-detail'),
]
