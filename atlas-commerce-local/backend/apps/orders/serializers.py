from rest_framework import serializers

from .models import Order, OrderItem


class CheckoutSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=120)
    address = serializers.CharField(max_length=255)
    address_line_2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=120)
    postcode = serializers.CharField(max_length=30)
    country = serializers.CharField(max_length=120, default='United Kingdom')
    fulfillment_method = serializers.ChoiceField(choices=Order.FULFILLMENT_CHOICES, default=Order.FULFILLMENT_COLLECTION)
    requested_window = serializers.CharField(max_length=120, required=False, allow_blank=True)
    customer_note = serializers.CharField(required=False, allow_blank=True)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'quantity', 'unit_price', 'line_total']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'fulfillment_method', 'requested_window', 'customer_note',
            'full_name', 'city', 'postcode', 'country', 'subtotal', 'total', 'created_at', 'items',
        ]
