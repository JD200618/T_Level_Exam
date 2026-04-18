from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='producer_location',
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name='product',
            name='producer_name',
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name='product',
            name='production_method',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
