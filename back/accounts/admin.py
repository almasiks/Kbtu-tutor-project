from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (('Tutor', {'fields': ('is_tutor',)}),)
    list_display = list(DjangoUserAdmin.list_display) + ['is_tutor']
    list_filter = list(DjangoUserAdmin.list_filter) + ['is_tutor']
