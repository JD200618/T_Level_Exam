from django.contrib.auth import get_user_model
from django.contrib.auth import login, logout
from django.db import transaction

from .models import CustomerAddress, SavedPaymentMethod

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


@transaction.atomic
def update_user_profile(user, *, name):
    name = name.strip()
    parts = name.split(None, 1)
    user.first_name = parts[0] if parts else ''
    user.last_name = parts[1] if len(parts) > 1 else ''
    if not user.first_name and name:
        user.username = name
    user.save(update_fields=['first_name', 'last_name'])
    return user


def list_user_addresses(user):
    return user.addresses.all()


def get_user_address(user, address_id):
    return user.addresses.filter(id=address_id).first()


@transaction.atomic
def create_user_address(user, data):
    if data.get('is_default'):
        user.addresses.update(is_default=False)
    return CustomerAddress.objects.create(
        user=user,
        label=data.get('label', ''),
        full_name=data['full_name'],
        line_1=data['address'],
        city=data['city'],
        postcode=data['postcode'],
        country=data['country'],
        is_default=data.get('is_default', False),
    )


@transaction.atomic
def update_user_address(address, data):
    if data.get('is_default'):
        address.user.addresses.exclude(id=address.id).update(is_default=False)
    address.full_name = data['full_name']
    address.line_1 = data['address']
    address.city = data['city']
    address.postcode = data['postcode']
    address.country = data['country']
    address.is_default = data.get('is_default', False)
    address.save(update_fields=['full_name', 'line_1', 'city', 'postcode', 'country', 'is_default', 'updated_at'])
    return address


def delete_user_address(address):
    address.delete()


def list_user_payment_methods(user):
    return user.payment_methods.all()


def get_user_payment_method(user, method_id):
    return user.payment_methods.filter(id=method_id).first()


@transaction.atomic
def create_user_payment_method(user, data):
    if data.get('is_default'):
        user.payment_methods.update(is_default=False)
    return SavedPaymentMethod.objects.create(
        user=user,
        brand=data['brand'],
        last4=data['last4'],
        expiry_month=data['expiry_month'],
        expiry_year=data['expiry_year'],
        is_default=data.get('is_default', False),
    )


def delete_user_payment_method(method):
    method.delete()
