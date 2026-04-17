from django.contrib.auth import get_user_model
from django.contrib.auth import login, logout

User = get_user_model()


def get_user_by_email(email):
    return User.objects.filter(email__iexact=email).first()


def authenticate_with_email(email, password):
    user = get_user_by_email(email)
    if not user:
        return None
    if not user.check_password(password):
        return None
    return user


def login_user(request, user):
    login(request, user)
    return user


def logout_user(request):
    logout(request)
