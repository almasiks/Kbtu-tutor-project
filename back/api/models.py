from django.db import models

# Create your models here.
class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Название предмета")

    class Meta:
        verbose_name = "Предмет"
        verbose_name_plural = "Предметы"

    def __str__(self):
        return self.name


class TutorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tutor_profile')
    experience = models.PositiveIntegerField(verbose_name="Опыт работы (лет)")
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, related_name='tutors')

    class Meta:
        verbose_name = "Профиль тьютора"
        verbose_name_plural = "Профили тьюторов"

    def __str__(self):
        return f"Тьютор {self.user.username} ({self.subject})"


class LessonSlot(models.Model):
    tutor = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name='slots')
    date = models.DateField(verbose_name="Дата")
    time = models.TimeField(verbose_name="Время")
    is_booked = models.BooleanField(default=False, verbose_name="Забронировано")

    class Meta:
        verbose_name = "Слот занятия"
        verbose_name_plural = "Слоты занятий"
        unique_together = ('tutor', 'date', 'time')

    def __str__(self):
        return f"Слот {self.tutor.user.username}: {self.date} в {self.time}"


class Booking(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_bookings')
    lesson_slot = models.OneToOneField(LessonSlot, on_delete=models.CASCADE, related_name='booking')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Время создания брони")

    class Meta:
        verbose_name = "Бронирование"
        verbose_name_plural = "Бронирования"

    def __str__(self):
        return f"{self.student.username} записан на {self.lesson_slot}"