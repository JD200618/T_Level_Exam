from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.products.models import InventoryRecord, Product, ProductCategory
from apps.users.models import CustomerAddress, SavedPaymentMethod

User = get_user_model()

DEMO_PASSWORD = 'demo1234'
ADMIN_PASSWORD = 'admin1234'

CATEGORY_FIXTURES = [
    {
        'slug': 'vegetables',
        'name': 'Vegetables',
        'description': 'Fresh vegetables for everyday cooking.',
    },
    {
        'slug': 'fruits',
        'name': 'Fruits',
        'description': 'Seasonal fruit for snacks, breakfasts, and desserts.',
    },
    {
        'slug': 'bakery',
        'name': 'Bakery',
        'description': 'Freshly baked goods from local artisan bakers.',
    },
    {
        'slug': 'dairy-eggs',
        'name': 'Dairy & Eggs',
        'description': 'Milk, cheese, yoghurt, and eggs from nearby farms.',
    },
]

PRODUCT_FIXTURES = [
    {
        'slug': 'organic-tomatoes',
        'category_slug': 'vegetables',
        'name': 'Organic Tomatoes',
        'summary': 'Vine-ripened tomatoes with balanced sweetness and acidity.',
        'description': 'A versatile kitchen staple for salads, sauces, and roasting.',
        'producer_name': 'Willow Farm',
        'producer_location': 'Cheshire',
        'production_method': 'Greenhouse-grown, pesticide-free, hand-picked twice weekly.',
        'price': '3.49',
        'image_url': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=1200&q=80',
        'is_featured': True,
        'stock_on_hand': 42,
    },
    {
        'slug': 'green-lettuce',
        'category_slug': 'vegetables',
        'name': 'Green Lettuce',
        'summary': 'Crisp lettuce heads for salads, wraps, and sandwiches.',
        'description': 'Fresh and clean with a light crunch.',
        'producer_name': 'Moss Lane Market Garden',
        'producer_location': 'Lancashire',
        'production_method': 'Small-batch regenerative growing with no synthetic sprays.',
        'price': '2.19',
        'image_url': 'https://images.unsplash.com/photo-1622205313162-be1d5712a43d?auto=format&fit=crop&w=1200&q=80',
        'is_featured': True,
        'stock_on_hand': 30,
    },
    {
        'slug': 'organic-carrots',
        'category_slug': 'vegetables',
        'name': 'Organic Carrots',
        'summary': 'Sweet whole carrots for roasting, juicing, or snacking.',
        'description': 'Bright and earthy with dependable texture.',
        'producer_name': 'Ridgeway Organics',
        'producer_location': 'Peak District',
        'production_method': 'Field-grown in living soil and washed on harvest morning.',
        'price': '2.89',
        'image_url': 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=1200&q=80',
        'is_featured': False,
        'stock_on_hand': 55,
    },
    {
        'slug': 'fresh-apples',
        'category_slug': 'fruits',
        'name': 'Fresh Apples',
        'summary': 'Crisp apples suited for lunchboxes and light desserts.',
        'description': 'A reliable all-purpose fruit with a clean bite.',
        'producer_name': 'Old Orchard Co-op',
        'producer_location': 'Herefordshire',
        'production_method': 'Heritage orchard fruit, graded by hand for shop and box orders.',
        'price': '4.29',
        'image_url': 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1200&q=80',
        'is_featured': True,
        'stock_on_hand': 64,
    },
    {
        'slug': 'sweet-strawberries',
        'category_slug': 'fruits',
        'name': 'Sweet Strawberries',
        'summary': 'Bright strawberries for breakfast bowls and desserts.',
        'description': 'Soft, fragrant fruit with balanced sweetness.',
        'producer_name': 'Hawthorn Fields',
        'producer_location': 'Kent',
        'production_method': 'Tunnel-grown berries harvested at ripeness for 24-hour turnaround.',
        'price': '5.99',
        'image_url': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1200&q=80',
        'is_featured': True,
        'stock_on_hand': 24,
    },
    {
        'slug': 'farmhouse-eggs',
        'category_slug': 'dairy-eggs',
        'name': 'Farmhouse Eggs',
        'summary': 'Free-range eggs boxed by a nearby family-run poultry farm.',
        'description': 'A half-dozen versatile eggs suited to breakfast, baking, and prep cooking.',
        'producer_name': 'Brookside Poultry',
        'producer_location': 'Shropshire',
        'production_method': 'Free-range flock management with weekly welfare checks and small-batch packing.',
        'price': '3.79',
        'image_url': 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=1200&q=80',
        'is_featured': False,
        'stock_on_hand': 48,
    },
    {
        'slug': 'whole-milk',
        'category_slug': 'dairy-eggs',
        'name': 'Whole Milk',
        'summary': 'Creamy local milk bottled for everyday kitchen use.',
        'description': 'A one-litre bottle from a nearby dairy, chilled and delivered in the regular GLH run.',
        'producer_name': 'Meadow Rise Dairy',
        'producer_location': 'North Yorkshire',
        'production_method': 'Low-mileage dairy supply with cooled bottling on the same day as collection.',
        'price': '2.49',
        'image_url': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
        'is_featured': False,
        'stock_on_hand': 18,
    },
    {
        'slug': 'sourdough-loaf',
        'category_slug': 'bakery',
        'name': 'Sourdough Loaf',
        'summary': 'Slow-fermented sourdough baked by a local bakery partner.',
        'description': 'A crusty white sourdough loaf with an open crumb, ideal for breakfasts and sandwiches.',
        'producer_name': 'Stone Oven Bakery',
        'producer_location': 'Leeds',
        'production_method': 'Long ferment, stone-baked loaves prepared in small morning batches.',
        'price': '4.99',
        'image_url': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
        'is_featured': True,
        'stock_on_hand': 12,
    },
    {
        'slug': 'greek-style-yoghurt',
        'category_slug': 'dairy-eggs',
        'name': 'Greek Style Yoghurt',
        'summary': 'Thick local yoghurt for breakfasts, dressings, and cooking.',
        'description': 'Rich cultured yoghurt made in small batches with a smooth finish.',
        'producer_name': 'Meadow Rise Dairy',
        'producer_location': 'North Yorkshire',
        'production_method': 'Cultured in insulated small vats and chilled before dispatch.',
        'price': '3.69',
        'image_url': 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=1200&q=80',
        'is_featured': False,
        'stock_on_hand': 16,
    },
]


class Command(BaseCommand):
    help = 'Seed the desktop-local ecommerce prototype with demo users, categories, products, inventory, and profile data.'

    @transaction.atomic
    def handle(self, *args, **options):
        categories = self._seed_categories()
        self._seed_products(categories)
        self._seed_users()

        if options.get('verbosity', 1) > 0:
            self.stdout.write(self.style.SUCCESS('Demo ecommerce data is ready.'))
            self.stdout.write('Admin login: admin@glh.local / admin1234')
            self.stdout.write('Customer login: sarah@glh.local / demo1234')

    def _seed_categories(self):
        categories = {}
        for fixture in CATEGORY_FIXTURES:
            category, _ = ProductCategory.objects.update_or_create(
                slug=fixture['slug'],
                defaults={
                    'name': fixture['name'],
                    'description': fixture['description'],
                    'is_active': True,
                },
            )
            categories[fixture['slug']] = category
        return categories

    def _seed_products(self, categories):
        for fixture in PRODUCT_FIXTURES:
            category = categories[fixture['category_slug']]
            product, _ = Product.objects.update_or_create(
                slug=fixture['slug'],
                defaults={
                    'category': category,
                    'name': fixture['name'],
                    'summary': fixture['summary'],
                    'description': fixture['description'],
                    'producer_name': fixture.get('producer_name', ''),
                    'producer_location': fixture.get('producer_location', ''),
                    'production_method': fixture.get('production_method', ''),
                    'price': fixture['price'],
                    'image_url': fixture['image_url'],
                    'is_featured': fixture['is_featured'],
                    'is_active': True,
                },
            )
            InventoryRecord.objects.update_or_create(
                product=product,
                defaults={'stock_on_hand': fixture['stock_on_hand']},
            )

    def _seed_users(self):
        admin_user = self._upsert_user(
            username='glh-admin',
            email='admin@glh.local',
            password=ADMIN_PASSWORD,
            first_name='GLH',
            last_name='Admin',
            is_staff=True,
            is_superuser=True,
        )
        self._seed_profile_data(
            admin_user,
            full_name='GLH Admin',
            line_1='1 Control Plane Way',
            city='London',
            postcode='EC1A 1AA',
            country='United Kingdom',
        )

        customer_user = self._upsert_user(
            username='sarah-johnson',
            email='sarah@glh.local',
            password=DEMO_PASSWORD,
            first_name='Sarah',
            last_name='Johnson',
            is_staff=False,
            is_superuser=False,
        )
        self._seed_profile_data(
            customer_user,
            full_name='Sarah Johnson',
            line_1='22 Market Street',
            city='Manchester',
            postcode='M1 1AE',
            country='United Kingdom',
        )

    def _upsert_user(self, *, username, email, password, first_name, last_name, is_staff, is_superuser):
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'first_name': first_name,
                'last_name': last_name,
                'is_staff': is_staff,
                'is_superuser': is_superuser,
                'is_active': True,
            },
        )

        fields_to_update = []
        if user.username != username:
            user.username = username
            fields_to_update.append('username')
        if user.first_name != first_name:
            user.first_name = first_name
            fields_to_update.append('first_name')
        if user.last_name != last_name:
            user.last_name = last_name
            fields_to_update.append('last_name')
        if user.is_staff != is_staff:
            user.is_staff = is_staff
            fields_to_update.append('is_staff')
        if user.is_superuser != is_superuser:
            user.is_superuser = is_superuser
            fields_to_update.append('is_superuser')
        if not user.is_active:
            user.is_active = True
            fields_to_update.append('is_active')

        if created or not user.check_password(password):
            user.set_password(password)
            fields_to_update.append('password')

        if fields_to_update:
            user.save(update_fields=fields_to_update)
        return user

    def _seed_profile_data(self, user, *, full_name, line_1, city, postcode, country):
        CustomerAddress.objects.update_or_create(
            user=user,
            label='Primary',
            defaults={
                'full_name': full_name,
                'line_1': line_1,
                'line_2': '',
                'city': city,
                'postcode': postcode,
                'country': country,
                'is_default': True,
            },
        )
        SavedPaymentMethod.objects.update_or_create(
            user=user,
            last4='4242',
            defaults={
                'brand': 'Visa',
                'expiry_month': 12,
                'expiry_year': 2030,
                'is_default': True,
            },
        )
