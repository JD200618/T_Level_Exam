from rest_framework import serializers

from .models import Product, ProductCategory


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'slug', 'description']


class ProductSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    available_stock = serializers.IntegerField(source='inventory.stock_on_hand', read_only=True)
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'summary', 'description', 'price', 'image_url',
            'is_featured', 'category', 'available_stock', 'in_stock',
        ]

    def get_in_stock(self, obj):
        inventory = getattr(obj, 'inventory', None)
        if not inventory:
            return False
        return inventory.stock_on_hand > 0
