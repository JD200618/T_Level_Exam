from rest_framework import serializers

from .models import Order, OrderItem


class CheckoutSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=120)
    address = serializers.CharField(max_length=255)
    address_line_2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=120)
    postcode = serializers.CharField(max_length=30)
    country = serializers.CharField(max_length=120, default='United Kingdom')


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'quantity', 'unit_price', 'line_total']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'full_name', 'city', 'postcode',
            'country', 'subtotal', 'total', 'created_at', 'items',
        ]
