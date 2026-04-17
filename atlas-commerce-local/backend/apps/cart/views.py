from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.common.responses import success_response

from .serializers import AddCartItemSerializer, CartSerializer, UpdateCartItemSerializer
from .services import (
    add_item_to_cart,
    build_cart_queryset,
    get_cart_item_by_id,
    get_or_create_active_cart,
    get_product_for_cart,
    remove_cart_item,
    update_cart_item_quantity,
)


class CartDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = build_cart_queryset(get_or_create_active_cart(request))
        return success_response(data={'cart': CartSerializer(cart).data}, message='Cart loaded')


class CartItemCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_or_create_active_cart(request)
        product = get_product_for_cart(serializer.validated_data['product_slug'])
        if not product:
            return success_response(message='Product not found', status_code=404)
        add_item_to_cart(cart, product, serializer.validated_data['quantity'])
        cart = build_cart_queryset(cart)
        return success_response(data={'cart': CartSerializer(cart).data}, message='Item added to cart', status_code=201)


class CartItemUpdateView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_or_create_active_cart(request)
        cart_item = get_cart_item_by_id(cart, item_id)
        if not cart_item:
            return success_response(message='Cart item not found', status_code=404)
        update_cart_item_quantity(cart_item, serializer.validated_data['quantity'])
        cart = build_cart_queryset(cart)
        return success_response(data={'cart': CartSerializer(cart).data}, message='Cart updated')

    def delete(self, request, item_id):
        cart = get_or_create_active_cart(request)
        cart_item = get_cart_item_by_id(cart, item_id)
        if not cart_item:
            return success_response(message='Cart item not found', status_code=404)
        remove_cart_item(cart_item)
        cart = build_cart_queryset(cart)
        return success_response(data={'cart': CartSerializer(cart).data}, message='Cart item removed')
