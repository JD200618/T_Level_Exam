from django.conf import settings
from django.db import models

from apps.products.models import Product


class Cart(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_ORDERED = 'ordered'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_ORDERED, 'Ordered'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='carts', on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=64, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        owner = self.user.username if self.user_id else self.session_key or 'guest'
        return f'Cart {self.id} ({owner})'


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='cart_items', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product')
        ordering = ['id']

    def __str__(self):
        return f'{self.product.name} x {self.quantity}'
