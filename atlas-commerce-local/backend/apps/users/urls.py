from django.urls import path

from .views import CurrentUserView, LoginView, LogoutView

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='users-me'),
    path('login/', LoginView.as_view(), name='users-login'),
    path('logout/', LogoutView.as_view(), name='users-logout'),
]
