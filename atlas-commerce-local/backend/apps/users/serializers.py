from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import CustomerAddress, SavedPaymentMethod

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ProfileUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)


class AddressWriteSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=120)
    address = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=120)
    postcode = serializers.CharField(max_length=30)
    country = serializers.CharField(max_length=120, default='United Kingdom')
    is_default = serializers.BooleanField(default=False)


class PaymentMethodWriteSerializer(serializers.Serializer):
    brand = serializers.CharField(max_length=50)
    last4 = serializers.CharField(max_length=4)
    expiry_month = serializers.IntegerField(min_value=1, max_value=12)
    expiry_year = serializers.IntegerField(min_value=2024, max_value=2100)
    is_default = serializers.BooleanField(default=False)


class CustomerAddressSerializer(serializers.ModelSerializer):
    address = serializers.CharField(source='line_1')

    class Meta:
        model = CustomerAddress
        fields = ['id', 'label', 'full_name', 'address', 'line_2', 'city', 'postcode', 'country', 'is_default']


class SavedPaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedPaymentMethod
        fields = ['id', 'brand', 'last4', 'expiry_month', 'expiry_year', 'is_default']


class CurrentUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='date_joined', read_only=True)
    addresses = CustomerAddressSerializer(many=True, read_only=True)
    payment_methods = SavedPaymentMethodSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'name',
            'role', 'is_staff', 'created_at', 'addresses', 'payment_methods',
        ]

    def get_name(self, obj):
        full_name = obj.get_full_name().strip()
        return full_name or obj.username

    def get_role(self, obj):
        return 'admin' if obj.is_staff else 'customer'
