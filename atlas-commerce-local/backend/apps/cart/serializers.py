from rest_framework import serializers

from apps.products.serializers import ProductSerializer

from .models import Cart, CartItem


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False)
    product_slug = serializers.SlugField(required=False)
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate(self, attrs):
        if not attrs.get('product_id') and not attrs.get('product_slug'):
            raise serializers.ValidationError('product_id or product_slug is required')
        return attrs


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
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'status', 'items', 'total_items', 'subtotal', 'total']

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj):
        return round(sum(float(item.product.price) * item.quantity for item in obj.items.all()), 2)

    def get_total(self, obj):
        return self.get_subtotal(obj)
