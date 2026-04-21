from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_booking_refactor_rate'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='booking',
            options={'ordering': ['-date']},
        ),
    ]
