from django.contrib import admin

from .models import CustomerAddress, SavedPaymentMethod


@admin.register(CustomerAddress)
class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'city', 'country', 'is_default')
    list_filter = ('country', 'is_default')
    search_fields = ('full_name', 'user__username', 'user__email', 'city')


@admin.register(SavedPaymentMethod)
class SavedPaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('brand', 'last4', 'user', 'expiry_month', 'expiry_year', 'is_default')
    list_filter = ('brand', 'is_default')
    search_fields = ('user__username', 'user__email', 'last4')
