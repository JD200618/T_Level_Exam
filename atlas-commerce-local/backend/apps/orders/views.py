from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.cart.services import get_or_create_active_cart
from apps.common.responses import success_response

from .serializers import CheckoutSerializer, OrderSerializer
from .services import list_orders_for_user, place_order, preview_checkout


class CheckoutPreviewView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cart = get_or_create_active_cart(request)
        return success_response(data={'summary': preview_checkout(cart)}, message='Checkout preview ready')


class CheckoutPlaceView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_or_create_active_cart(request)
        try:
            order = place_order(cart=cart, checkout_data=serializer.validated_data, user=request.user)
        except ValueError as exc:
            return success_response(message=str(exc), status_code=400)
        return success_response(data={'order': OrderSerializer(order).data}, message='Order placed', status_code=201)


class OrderListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        orders = list_orders_for_user(request.user)
        serializer = OrderSerializer(orders, many=True)
        return success_response(data={'orders': serializer.data}, message='Orders loaded')
