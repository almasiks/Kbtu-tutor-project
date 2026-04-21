from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='booking',
            name='lesson_slot',
        ),
        migrations.RemoveField(
            model_name='booking',
            name='created_at',
        ),
        migrations.AddField(
            model_name='booking',
            name='date',
            field=models.DateTimeField(default='2026-01-01T00:00:00Z'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='booking',
            name='tutor',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='api.tutorprofile'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='booking',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')], default='pending', max_length=20),
        ),
    ]
