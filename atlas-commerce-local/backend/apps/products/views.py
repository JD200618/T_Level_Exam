from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.common.responses import success_response

from .serializers import ProductCategorySerializer, ProductSerializer
from .services import get_product_by_slug, list_active_categories, list_active_products


class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = list_active_products(
            search=request.query_params.get('search'),
            category_slug=request.query_params.get('category'),
            featured_only=request.query_params.get('featured') == 'true',
        )
        serializer = ProductSerializer(products, many=True)
        return success_response(data={'products': serializer.data}, message='Products loaded')


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        product = get_product_by_slug(slug)
        if not product:
            return success_response(data={'product': None}, message='Product not found', status_code=404)
        return success_response(data={'product': ProductSerializer(product).data}, message='Product loaded')


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = list_active_categories()
        return success_response(
            data={'categories': ProductCategorySerializer(categories, many=True).data},
            message='Categories loaded',
        )
