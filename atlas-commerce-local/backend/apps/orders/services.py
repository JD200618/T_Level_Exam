from decimal import Decimal
from uuid import uuid4

from django.db import transaction

from apps.cart.models import Cart
from apps.products.models import InventoryRecord

from .models import Order, OrderItem


def calculate_cart_totals(cart):
    subtotal = Decimal('0.00')
    items = list(cart.items.select_related('product', 'product__inventory'))
    for cart_item in items:
        subtotal += cart_item.product.price * cart_item.quantity
    return items, subtotal.quantize(Decimal('0.01'))


def preview_checkout(cart):
    items, subtotal = calculate_cart_totals(cart)
    return {
        'item_count': sum(item.quantity for item in items),
        'subtotal': float(subtotal),
        'total': float(subtotal),
    }


def build_order_number():
    return f'ORD-{uuid4().hex[:10].upper()}'


@transaction.atomic
def place_order(*, cart, checkout_data, user=None):
    items, subtotal = calculate_cart_totals(cart)
    if not items:
        raise ValueError('Cart is empty')

    for cart_item in items:
        inventory = InventoryRecord.objects.select_for_update().get(product=cart_item.product)
        if inventory.stock_on_hand < cart_item.quantity:
            raise ValueError(f'Insufficient stock for {cart_item.product.name}')

    order = Order.objects.create(
        user=user if getattr(user, 'is_authenticated', False) else None,
        cart=cart,
        order_number=build_order_number(),
        status=Order.STATUS_CONFIRMED,
        full_name=checkout_data['full_name'],
        address_line_1=checkout_data['address'],
        address_line_2=checkout_data.get('address_line_2', ''),
        city=checkout_data['city'],
        postcode=checkout_data['postcode'],
        country=checkout_data['country'],
        subtotal=subtotal,
        total=subtotal,
    )

    for cart_item in items:
        inventory = InventoryRecord.objects.select_for_update().get(product=cart_item.product)
        inventory.stock_on_hand -= cart_item.quantity
        inventory.save(update_fields=['stock_on_hand', 'updated_at'])
        OrderItem.objects.create(
            order=order,
            product=cart_item.product,
            product_name=cart_item.product.name,
            quantity=cart_item.quantity,
            unit_price=cart_item.product.price,
            line_total=cart_item.product.price * cart_item.quantity,
        )

    cart.status = Cart.STATUS_ORDERED
    cart.save(update_fields=['status', 'updated_at'])
    cart.items.all().delete()
    return order


def list_orders_for_user(user):
    if not user.is_authenticated:
        return Order.objects.none()
    return Order.objects.prefetch_related('items').filter(user=user)
