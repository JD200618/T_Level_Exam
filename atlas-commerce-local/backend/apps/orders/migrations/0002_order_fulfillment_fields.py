from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='customer_note',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='order',
            name='fulfillment_method',
            field=models.CharField(choices=[('collection', 'Collection'), ('delivery', 'Delivery')], default='collection', max_length=20),
        ),
        migrations.AddField(
            model_name='order',
            name='requested_window',
            field=models.CharField(blank=True, max_length=120),
        ),
    ]
