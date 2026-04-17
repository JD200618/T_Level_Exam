from rest_framework import serializers

from apps.products.serializers import ProductSerializer

from .models import Cart, CartItem


class AddCartItemSerializer(serializers.Serializer):
    product_slug = serializers.SlugField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'line_total']

    def get_line_total(self, obj):
        return round(float(obj.product.price) * obj.quantity, 2)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'status', 'items', 'total_items', 'subtotal']

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj):
        return round(sum(float(item.product.price) * item.quantity for item in obj.items.all()), 2)
