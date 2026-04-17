from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomerAddress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(blank=True, max_length=50)),
                ('full_name', models.CharField(max_length=120)),
                ('line_1', models.CharField(max_length=255)),
                ('line_2', models.CharField(blank=True, max_length=255)),
                ('city', models.CharField(max_length=120)),
                ('postcode', models.CharField(max_length=30)),
                ('country', models.CharField(default='United Kingdom', max_length=120)),
                ('is_default', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='addresses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-is_default', 'id'],
            },
        ),
        migrations.CreateModel(
            name='SavedPaymentMethod',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('brand', models.CharField(max_length=50)),
                ('last4', models.CharField(max_length=4)),
                ('expiry_month', models.PositiveSmallIntegerField()),
                ('expiry_year', models.PositiveSmallIntegerField()),
                ('is_default', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payment_methods', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-is_default', 'id'],
            },
        ),
    ]
