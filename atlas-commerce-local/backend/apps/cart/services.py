from django.db import transaction

from apps.products.models import Product

from .models import Cart, CartItem


def ensure_session_key(request):
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


def get_or_create_active_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user, status=Cart.STATUS_ACTIVE, defaults={'session_key': ''})
        return cart
    session_key = ensure_session_key(request)
    cart, _ = Cart.objects.get_or_create(session_key=session_key, status=Cart.STATUS_ACTIVE, defaults={'user': None})
    return cart


def get_cart_item_by_id(cart, item_id):
    return cart.items.select_related('product', 'product__category', 'product__inventory').filter(id=item_id).first()


def get_product_for_cart(product_slug):
    return Product.objects.select_related('inventory', 'category').filter(slug=product_slug, is_active=True).first()


def build_cart_queryset(cart):
    return Cart.objects.prefetch_related('items__product__category', 'items__product__inventory').get(id=cart.id)


@transaction.atomic
def add_item_to_cart(cart, product, quantity):
    cart_item, created = CartItem.objects.select_for_update().get_or_create(cart=cart, product=product, defaults={'quantity': quantity})
    if not created:
        cart_item.quantity += quantity
        cart_item.save(update_fields=['quantity', 'updated_at'])
    return cart_item


@transaction.atomic
def update_cart_item_quantity(cart_item, quantity):
    cart_item.quantity = quantity
    cart_item.save(update_fields=['quantity', 'updated_at'])
    return cart_item


@transaction.atomic
def remove_cart_item(cart_item):
    cart_item.delete()
