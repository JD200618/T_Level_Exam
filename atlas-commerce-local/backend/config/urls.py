from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/common/', include('apps.common.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]
