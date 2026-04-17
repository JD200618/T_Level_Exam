from django.contrib.auth import get_user_model
from django.db.models import Count, Sum

from apps.orders.models import Order, OrderItem
from apps.products.models import InventoryRecord, Product

User = get_user_model()
LOW_STOCK_THRESHOLD = 5


def build_dashboard_summary():
    revenue_total = Order.objects.aggregate(total_revenue=Sum('total'))['total_revenue'] or 0
    low_stock_products = InventoryRecord.objects.filter(stock_on_hand__lte=LOW_STOCK_THRESHOLD).count()
    featured_products = Product.objects.filter(is_active=True, is_featured=True).count()
    return {
        'product_count': Product.objects.filter(is_active=True).count(),
        'featured_product_count': featured_products,
        'order_count': Order.objects.count(),
        'paid_order_count': Order.objects.filter(status=Order.STATUS_PAID).count(),
        'low_stock_product_count': low_stock_products,
        'revenue_total': float(revenue_total),
    }


def build_admin_overview():
    revenue_total = Order.objects.aggregate(total_revenue=Sum('total'))['total_revenue'] or 0
    return {
        'products': Product.objects.filter(is_active=True).count(),
        'customers': User.objects.filter(is_staff=False).count(),
        'orders': Order.objects.count(),
        'revenue': float(revenue_total),
    }


def list_admin_inventory():
    products = Product.objects.select_related('category', 'inventory').filter(is_active=True)
    rows = []
    for product in products:
        stock_level = getattr(product.inventory, 'stock_on_hand', 0)
        rows.append({
            'id': product.id,
            'productId': product.id,
            'name': product.name,
            'category': product.category.name,
            'price': float(product.price),
            'unit': 'each',
            'stockLevel': stock_level,
            'lowStockThreshold': LOW_STOCK_THRESHOLD,
        })
    return rows


def update_inventory_stock(product_id, stock_level):
    inventory = InventoryRecord.objects.select_related('product').filter(product_id=product_id).first()
    if not inventory:
        return None
    inventory.stock_on_hand = max(0, stock_level)
    inventory.save(update_fields=['stock_on_hand', 'updated_at'])
    return inventory


def list_admin_orders():
    orders = Order.objects.select_related('user').all()
    rows = []
    for order in orders:
        rows.append({
            'id': order.id,
            'orderId': order.id,
            'orderNumber': order.order_number,
            'customerName': order.full_name,
            'customerEmail': order.user.email if order.user else 'guest@local',
            'date': order.created_at.isoformat(),
            'total': float(order.total),
            'status': order.status,
            'paymentStatus': order.status,
        })
    return rows


def update_admin_order_status(order_id, status):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return None
    order.status = status
    order.save(update_fields=['status', 'updated_at'])
    return order


def list_admin_customers():
    customers = (
        User.objects.filter(is_staff=False)
        .annotate(order_count=Count('orders'), total_spend=Sum('orders__total'))
        .order_by('-total_spend', 'id')
    )
    rows = []
    for customer in customers:
        total_spend = float(customer.total_spend or 0)
        order_count = int(customer.order_count or 0)
        rows.append({
            'id': customer.id,
            'name': customer.get_full_name().strip() or customer.username,
            'email': customer.email,
            'orderCount': order_count,
            'totalSpend': total_spend,
            'avgOrderValue': (total_spend / order_count) if order_count else 0,
        })
    return rows


def build_admin_analytics():
    revenue_by_status = []
    for row in Order.objects.values('status').annotate(orders=Count('id'), revenue=Sum('total')).order_by('status'):
        revenue_by_status.append({
            'status': row['status'],
            'orders': row['orders'],
            'revenue': float(row['revenue'] or 0),
        })

    top_products = []
    rows = (
        OrderItem.objects.values('product_name')
        .annotate(total_sold=Sum('quantity'), revenue=Sum('line_total'))
        .order_by('-total_sold', '-revenue')
    )
    for row in rows:
        top_products.append({
            'productName': row['product_name'],
            'totalSold': int(row['total_sold'] or 0),
            'revenue': float(row['revenue'] or 0),
        })

    return {
        'revenueByStatus': revenue_by_status,
        'topProducts': top_products,
    }
