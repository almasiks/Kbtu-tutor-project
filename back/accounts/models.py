from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    is_tutor = models.BooleanField(default=False, db_index=True)

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
