from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.products.models import InventoryRecord, Product, ProductCategory
from apps.users.models import CustomerAddress, SavedPaymentMethod

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo data for the desktop-local ecommerce prototype'

    def handle(self, *args, **options):
        admin_user, _ = User.objects.get_or_create(
            username='admin@greenfieldhub.local',
            defaults={
                'email': 'admin@greenfieldhub.local',
                'first_name': 'Greenfield',
                'last_name': 'Admin',
                'is_staff': True,
                'is_superuser': True,
            },
        )
        admin_user.set_password('DemoPass123!')
        admin_user.save()

        customer_user, _ = User.objects.get_or_create(
            username='sarah.johnson@example.com',
            defaults={
                'email': 'sarah.johnson@example.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
            },
        )
        customer_user.set_password('DemoPass123!')
        customer_user.save()

        CustomerAddress.objects.get_or_create(
            user=customer_user,
            label='Home',
            defaults={
                'full_name': 'Sarah Johnson',
                'line_1': '123 Green Street',
                'city': 'Springfield',
                'postcode': 'SP1 2AB',
                'country': 'United Kingdom',
                'is_default': True,
            },
        )

        SavedPaymentMethod.objects.get_or_create(
            user=customer_user,
            brand='Visa',
            last4='4242',
            expiry_month=12,
            expiry_year=2028,
            defaults={'is_default': True},
        )

        categories = {
            'bakery': 'Bakery',
            'fresh-produce': 'Fresh Produce',
        }
        category_objects = {}
        for slug, name in categories.items():
            category_objects[slug], _ = ProductCategory.objects.get_or_create(slug=slug, defaults={'name': name, 'description': f'{name} essentials'})

        demo_products = [
            ('sourdough-loaf', 'Sourdough Loaf', 'Freshly baked artisan sourdough.', 'bakery', Decimal('4.99'), 12, True),
            ('organic-bananas', 'Organic Bananas', 'Naturally sweet bananas by the bunch.', 'fresh-produce', Decimal('2.49'), 20, True),
            ('wholemeal-bread', 'Wholemeal Bread', 'Daily wholemeal bread loaf.', 'bakery', Decimal('3.29'), 8, False),
            ('baby-spinach', 'Baby Spinach', 'Fresh leafy greens for quick meals.', 'fresh-produce', Decimal('1.99'), 5, False),
        ]

        for slug, name, summary, category_slug, price, stock, is_featured in demo_products:
            product, _ = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'category': category_objects[category_slug],
                    'name': name,
                    'summary': summary,
                    'description': summary,
                    'price': price,
                    'is_featured': is_featured,
                    'image_url': '',
                },
            )
            InventoryRecord.objects.get_or_create(product=product, defaults={'stock_on_hand': stock})

        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully.'))
