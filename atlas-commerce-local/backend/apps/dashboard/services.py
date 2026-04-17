from django.db.models import Count, Sum

from apps.orders.models import Order
from apps.products.models import InventoryRecord, Product


def build_dashboard_summary():
    revenue_total = Order.objects.aggregate(total_revenue=Sum('total'))['total_revenue'] or 0
    low_stock_products = InventoryRecord.objects.filter(stock_on_hand__lte=5).count()
    featured_products = Product.objects.filter(is_active=True, is_featured=True).count()
    return {
        'product_count': Product.objects.filter(is_active=True).count(),
        'featured_product_count': featured_products,
        'order_count': Order.objects.count(),
        'confirmed_order_count': Order.objects.filter(status=Order.STATUS_CONFIRMED).count(),
        'low_stock_product_count': low_stock_products,
        'revenue_total': float(revenue_total),
    }
