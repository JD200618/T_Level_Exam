from django.contrib import admin

from .models import InventoryRecord, Product, ProductCategory


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active')
    prepopulated_fields = {'slug': ('name',)}


class InventoryInline(admin.StackedInline):
    model = InventoryRecord
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_featured', 'is_active')
    list_filter = ('category', 'is_featured', 'is_active')
    search_fields = ('name', 'slug', 'summary')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [InventoryInline]
