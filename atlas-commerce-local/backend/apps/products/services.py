from .models import Product, ProductCategory


def list_active_products(*, search=None, category_slug=None, featured_only=False):
    queryset = Product.objects.select_related('category', 'inventory').filter(is_active=True, category__is_active=True)
    if search:
        queryset = queryset.filter(name__icontains=search)
    if category_slug:
        queryset = queryset.filter(category__slug=category_slug)
    if featured_only:
        queryset = queryset.filter(is_featured=True)
    return queryset


def list_active_categories():
    return ProductCategory.objects.filter(is_active=True)


def get_product_by_slug(slug):
    return Product.objects.select_related('category', 'inventory').filter(slug=slug, is_active=True).first()
