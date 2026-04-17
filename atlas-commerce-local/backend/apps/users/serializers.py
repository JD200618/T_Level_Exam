from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import CustomerAddress, SavedPaymentMethod

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


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
    addresses = CustomerAddressSerializer(many=True, read_only=True)
    payment_methods = SavedPaymentMethodSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'name', 'is_staff', 'addresses', 'payment_methods']

    def get_name(self, obj):
        full_name = obj.get_full_name().strip()
        return full_name or obj.username
