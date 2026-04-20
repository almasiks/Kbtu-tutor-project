from django.conf import settings
from django.db import models


class ActiveTutorManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(user__is_active=True)

    def with_subject(self, subject_id):
        return self.get_queryset().filter(subject_id=subject_id)


class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class TutorProfile(models.Model):
    objects = models.Manager()
    active = ActiveTutorManager()

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tutor_profile')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, related_name='tutors')
    experience_years = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    def __str__(self):
        return f"Tutor: {self.user.username}"


class LessonSlot(models.Model):
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='slots')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        ordering = ['start_time']
        unique_together = ('tutor', 'start_time')

    def __str__(self):
        return f"{self.tutor.user.username}: {self.start_time} - {self.end_time}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    lesson_slot = models.OneToOneField(LessonSlot, on_delete=models.CASCADE, related_name='booking')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Confirmed')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.username} -> {self.lesson_slot}"
