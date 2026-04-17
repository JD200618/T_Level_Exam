from django.conf import settings
from django.db import models


class CustomerAddress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='addresses', on_delete=models.CASCADE)
    label = models.CharField(max_length=50, blank=True)
    full_name = models.CharField(max_length=120)
    line_1 = models.CharField(max_length=255)
    line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=120)
    postcode = models.CharField(max_length=30)
    country = models.CharField(max_length=120, default='United Kingdom')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_default', 'id']

    def __str__(self):
        return f'{self.full_name} - {self.city}'


class SavedPaymentMethod(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='payment_methods', on_delete=models.CASCADE)
    brand = models.CharField(max_length=50)
    last4 = models.CharField(max_length=4)
    expiry_month = models.PositiveSmallIntegerField()
    expiry_year = models.PositiveSmallIntegerField()
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_default', 'id']

    def __str__(self):
        return f'{self.brand} ****{self.last4}'
