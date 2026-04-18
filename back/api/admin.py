from django.contrib import admin
from .models import Subject, TutorProfile, LessonSlot, Booking


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


@admin.register(TutorProfile)
class TutorProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'subject', 'experience_years', 'hourly_rate', 'rating']
    list_filter = ['subject']
    search_fields = ['user__username']


@admin.register(LessonSlot)
class LessonSlotAdmin(admin.ModelAdmin):
    list_display = ['id', 'tutor', 'start_time', 'end_time', 'is_booked']
    list_filter = ['is_booked']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'lesson_slot', 'status', 'created_at']
    list_filter = ['status']
