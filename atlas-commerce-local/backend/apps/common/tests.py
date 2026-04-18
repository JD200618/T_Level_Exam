from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework.test import APIClient, APITestCase

from apps.orders.models import Order
from apps.products.models import InventoryRecord, Product
from apps.users.models import CustomerAddress, SavedPaymentMethod

User = get_user_model()


class SessionApiTestCase(APITestCase):
    def make_client(self):
        client = APIClient(enforce_csrf_checks=True)
        response = client.get('/api/users/me/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('csrftoken', client.cookies)
        return client

    def login_client(self, *, email, password):
        client = self.make_client()
        csrf_token = client.cookies['csrftoken'].value
        response = client.post(
            '/api/users/login/',
            {'email': email, 'password': password},
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['ok'])
        self.assertTrue(response.data['data']['authenticated'])
        self.assertIn('csrftoken', client.cookies)
        return client


class CustomerCommerceFlowTests(SessionApiTestCase):
    def test_browser_style_local_frontend_origin_can_complete_session_and_cart_requests(self):
        call_command('seed_demo_data', verbosity=0)
        client = APIClient(enforce_csrf_checks=True)
        origin = 'http://127.0.0.1:5173'

        me_response = client.get('/api/users/me/', HTTP_ORIGIN=origin)
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.headers.get('access-control-allow-origin'), origin)
        csrf_token = client.cookies['csrftoken'].value

        login_response = client.post(
            '/api/users/login/',
            {'email': 'sarah@glh.local', 'password': 'demo1234'},
            format='json',
            HTTP_ORIGIN=origin,
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertTrue(login_response.data['data']['authenticated'])

        refreshed_csrf_token = client.cookies['csrftoken'].value
        add_to_cart_response = client.post(
            '/api/cart/items/',
            {'product_id': Product.objects.get(slug='organic-tomatoes').id, 'quantity': 1},
            format='json',
            HTTP_ORIGIN=origin,
            HTTP_X_CSRFTOKEN=refreshed_csrf_token,
        )
        self.assertEqual(add_to_cart_response.status_code, 201)
        self.assertEqual(add_to_cart_response.headers.get('access-control-allow-origin'), origin)
        self.assertEqual(add_to_cart_response.data['data']['cart']['total_items'], 1)

    def setUp(self):
        super().setUp()
        call_command('seed_demo_data', verbosity=0)
        self.customer = User.objects.get(email='sarah@glh.local')
        self.product = Product.objects.get(slug='organic-tomatoes')

    def test_customer_profile_checkout_and_order_history_are_connected_end_to_end(self):
        client = self.login_client(email='sarah@glh.local', password='demo1234')
        csrf_token = client.cookies['csrftoken'].value
        starting_stock = InventoryRecord.objects.get(product=self.product).stock_on_hand

        profile_response = client.patch(
            '/api/users/profile/',
            {'name': 'Sarah Carter'},
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(profile_response.status_code, 200)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.first_name, 'Sarah')
        self.assertEqual(self.customer.last_name, 'Carter')

        address_response = client.post(
            '/api/users/addresses/',
            {
                'full_name': 'Sarah Carter',
                'address': '88 Orchard Close',
                'city': 'York',
                'postcode': 'YO1 7AB',
                'country': 'United Kingdom',
                'is_default': True,
            },
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(address_response.status_code, 201)
        self.assertEqual(CustomerAddress.objects.filter(user=self.customer, is_default=True).count(), 1)
        self.assertTrue(CustomerAddress.objects.filter(user=self.customer, line_1='88 Orchard Close', is_default=True).exists())

        payment_response = client.post(
            '/api/users/payment-methods/',
            {
                'brand': 'Mastercard',
                'last4': '1111',
                'expiry_month': 9,
                'expiry_year': 2031,
                'is_default': True,
            },
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(payment_response.status_code, 201)
        self.assertEqual(SavedPaymentMethod.objects.filter(user=self.customer, is_default=True).count(), 1)
        self.assertTrue(SavedPaymentMethod.objects.filter(user=self.customer, last4='1111', is_default=True).exists())

        add_to_cart_response = client.post(
            '/api/cart/items/',
            {'product_id': self.product.id, 'quantity': 2},
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(add_to_cart_response.status_code, 201)
        self.assertEqual(add_to_cart_response.data['data']['cart']['total_items'], 2)

        preview_response = client.post(
            '/api/orders/checkout/preview/',
            {},
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(preview_response.status_code, 200)
        self.assertEqual(preview_response.data['data']['summary']['item_count'], 2)

        place_order_response = client.post(
            '/api/orders/checkout/place/',
            {
                'full_name': 'Sarah Carter',
                'address': '88 Orchard Close',
                'city': 'York',
                'postcode': 'YO1 7AB',
                'country': 'United Kingdom',
                'fulfillment_method': 'delivery',
                'requested_window': 'Tomorrow evening, 18:00 to 21:00',
                'customer_note': 'Please leave in the cool box.',
            },
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(place_order_response.status_code, 201)
        order_id = place_order_response.data['data']['order']['id']
        order = Order.objects.get(id=order_id)
        self.assertEqual(order.user, self.customer)
        self.assertEqual(order.fulfillment_method, 'delivery')
        self.assertEqual(order.items.count(), 1)

        updated_stock = InventoryRecord.objects.get(product=self.product).stock_on_hand
        self.assertEqual(updated_stock, starting_stock - 2)

        orders_response = client.get('/api/orders/')
        self.assertEqual(orders_response.status_code, 200)
        self.assertEqual(len(orders_response.data['data']['orders']), 1)
        self.assertEqual(orders_response.data['data']['orders'][0]['id'], order.id)

    def test_checkout_blocks_order_when_requested_quantity_exceeds_stock(self):
        client = self.login_client(email='sarah@glh.local', password='demo1234')
        csrf_token = client.cookies['csrftoken'].value
        inventory = InventoryRecord.objects.get(product=self.product)
        starting_stock = inventory.stock_on_hand

        add_to_cart_response = client.post(
            '/api/cart/items/',
            {'product_id': self.product.id, 'quantity': inventory.stock_on_hand + 1},
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(add_to_cart_response.status_code, 201)

        place_order_response = client.post(
            '/api/orders/checkout/place/',
            {
                'full_name': 'Sarah Johnson',
                'address': '22 Market Street',
                'city': 'Manchester',
                'postcode': 'M1 1AE',
                'country': 'United Kingdom',
                'fulfillment_method': 'collection',
            },
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(place_order_response.status_code, 400)
        self.assertIn('Insufficient stock', place_order_response.data['message'])
        inventory.refresh_from_db()
        self.assertEqual(inventory.stock_on_hand, starting_stock)


class AdminDashboardFlowTests(SessionApiTestCase):
    def setUp(self):
        super().setUp()
        call_command('seed_demo_data', verbosity=0)
        self.admin = User.objects.get(email='admin@glh.local')
        self.customer = User.objects.get(email='sarah@glh.local')
        self.product = Product.objects.get(slug='organic-tomatoes')
        self.order = self._create_customer_order()

    def _create_customer_order(self):
        client = self.login_client(email='sarah@glh.local', password='demo1234')
        csrf_token = client.cookies['csrftoken'].value
        client.post(
            '/api/cart/items/',
            {'product_id': self.product.id, 'quantity': 1},
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        response = client.post(
            '/api/orders/checkout/place/',
            {
                'full_name': 'Sarah Johnson',
                'address': '22 Market Street',
                'city': 'Manchester',
                'postcode': 'M1 1AE',
                'country': 'United Kingdom',
                'fulfillment_method': 'collection',
                'requested_window': 'Saturday morning',
            },
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(response.status_code, 201)
        return Order.objects.get(id=response.data['data']['order']['id'])

    def test_admin_can_read_and_update_dashboard_data_across_layers(self):
        client = self.login_client(email='admin@glh.local', password='admin1234')
        csrf_token = client.cookies['csrftoken'].value

        overview_response = client.get('/api/dashboard/admin/overview/')
        self.assertEqual(overview_response.status_code, 200)
        self.assertGreaterEqual(overview_response.data['data']['overview']['products'], 1)
        self.assertGreaterEqual(overview_response.data['data']['overview']['customers'], 1)

        inventory_patch_response = client.patch(
            f'/api/dashboard/admin/inventory/{self.product.id}/',
            {
                'stockLevel': 21,
                'price': '4.25',
                'summary': 'Updated through dependable admin flow',
                'producerName': 'Willow Farm',
                'producerLocation': 'Cheshire',
                'productionMethod': 'Updated in integration test',
                'isFeatured': True,
            },
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(inventory_patch_response.status_code, 200)
        self.product.refresh_from_db()
        self.product.inventory.refresh_from_db()
        self.assertEqual(self.product.inventory.stock_on_hand, 21)
        self.assertEqual(str(self.product.price), '4.25')
        self.assertEqual(self.product.summary, 'Updated through dependable admin flow')
        self.assertTrue(self.product.is_featured)

        orders_patch_response = client.patch(
            f'/api/dashboard/admin/orders/{self.order.id}/status/',
            {'status': 'delivered'},
            format='json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(orders_patch_response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'delivered')

        customers_response = client.get('/api/dashboard/admin/customers/')
        self.assertEqual(customers_response.status_code, 200)
        customer_emails = [row['email'] for row in customers_response.data['data']['customers']]
        self.assertIn(self.customer.email, customer_emails)

        analytics_response = client.get('/api/dashboard/admin/analytics/')
        self.assertEqual(analytics_response.status_code, 200)
        self.assertGreaterEqual(len(analytics_response.data['data']['analytics']['revenueByStatus']), 1)
        self.assertGreaterEqual(len(analytics_response.data['data']['analytics']['topProducts']), 1)

    def test_customer_cannot_access_admin_dashboard_endpoints(self):
        client = self.login_client(email='sarah@glh.local', password='demo1234')
        response = client.get('/api/dashboard/admin/overview/')
        self.assertEqual(response.status_code, 403)
