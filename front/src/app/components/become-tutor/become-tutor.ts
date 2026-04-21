import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-become-tutor',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './become-tutor.html',
  styleUrl: './become-tutor.css',
})
export class BecomeTutor {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  readonly subjects = [
    { id: 1,  name: 'Web Разработка' },
    { id: 2,  name: 'Академический казахский язык (B2)' },
    { id: 3,  name: 'Введение в машинное обучение' },
    { id: 4,  name: 'ИТ инфраструктура и Компьютерные сети' },
    { id: 5,  name: 'Объектно-ориентированное программирование и дизайн' },
    { id: 6,  name: 'Физическая культура' },
    { id: 7,  name: 'Алгоритмы и структуры данных' },
    { id: 8,  name: 'Архитектура компьютерных систем' },
    { id: 9,  name: 'Базы данных' },
    { id: 10, name: 'Принципы программирования I/II' },
    { id: 11, name: 'Статистика' },
    { id: 12, name: 'Дискретные структуры' },
    { id: 13, name: 'Иностранный язык (английский B2)' },
    { id: 14, name: 'Исчисление 1/2' },
    { id: 15, name: 'Модуль социально-политических знаний' },
    { id: 16, name: 'Философия' },
    { id: 17, name: 'Информационно-коммуникационные технологии' },
    { id: 18, name: 'История Казахстана' },
    { id: 19, name: 'Линейная алгебра для инженеров' },
    { id: 20, name: 'Дифференциальные уравнения' },
    { id: 21, name: 'Теория вероятностей' },
  ];

  form = this.fb.group({
    subject_id: [null as number | null, Validators.required],
    experience_years: [null as number | null, [Validators.required, Validators.min(0), Validators.max(10)]],
    bio: ['', [Validators.required, Validators.minLength(20)]],
    hourly_rate: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.submitError = '';
    const { subject_id, experience_years, bio, hourly_rate } = this.form.value;
    this.apiService.createTutorProfile({
      subject_id: subject_id!,
      experience_years: experience_years!,
      bio: bio!,
      hourly_rate: hourly_rate!,
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        setTimeout(() => this.router.navigate(['/'], { state: { toast: 'Ваш профиль тьютора создан!' } }), 1800);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.detail ?? 'Ошибка при сохранении. Попробуйте ещё раз.';
      },
    });
  }
}
