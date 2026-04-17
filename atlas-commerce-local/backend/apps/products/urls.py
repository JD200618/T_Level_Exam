from django.urls import path

from .views import CategoryListView, ProductDetailView, ProductListView

urlpatterns = [
    path('', ProductListView.as_view(), name='products-list'),
    path('categories/', CategoryListView.as_view(), name='products-categories'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='products-detail'),
]
