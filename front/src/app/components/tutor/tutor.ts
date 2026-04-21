import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';
import { TutorProfile } from '../../models/tutor';

@Component({
  selector: 'app-tutor-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe],
  templateUrl: './tutor.html',
  styleUrl: './tutor.css',
})
export class TutorDetailComponent implements OnInit {
  tutor: TutorProfile | null = null;
  loading = true;
  errorMessage: string | null = null;

  freeSlots: any[] = [];
  slotsLoading = false;
  selectedSlotId: number | null = null;
  selectedSlot: any | null = null;
  bookingLoading = false;
  bookingSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.loading = false;
      this.errorMessage = 'Неверный ID тьютора.';
      this.cdr.markForCheck();
      return;
    }
    this.api.getTutor(id).subscribe({
      next: (t) => {
        this.tutor = t;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadSlots(t.id);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Не удалось загрузить профиль тьютора.';
        this.cdr.markForCheck();
      },
    });
  }

  private loadSlots(tutorProfileId: number): void {
    this.slotsLoading = true;
    this.api.getTutorSlots(tutorProfileId).subscribe({
      next: (slots) => {
        this.freeSlots = slots.filter((s) => !s.is_booked);
        this.slotsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.slotsLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  bookLesson(): void {
    if (this.freeSlots.length === 0) {
      this.errorMessage = 'Нет доступных слотов.';
      this.cdr.markForCheck();
    } else {
      document.querySelector('.slots-card')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  selectSlot(id: number): void {
    if (this.selectedSlotId === id) {
      this.selectedSlotId = null;
      this.selectedSlot = null;
    } else {
      this.selectedSlotId = id;
      this.selectedSlot = this.freeSlots.find((s) => s.id === id) ?? null;
    }
    this.bookingSuccess = false;
    this.errorMessage = null;
  }

  confirmBooking(): void {
    if (!this.selectedSlotId || !this.api.isLoggedIn()) {
      this.errorMessage = 'Войдите в аккаунт чтобы забронировать урок.';
      this.cdr.markForCheck();
      return;
    }
    this.bookingLoading = true;
    this.api.createBooking(this.selectedSlotId).subscribe({
      next: () => {
        this.bookingSuccess = true;
        this.bookingLoading = false;
        this.freeSlots = this.freeSlots.filter((s) => s.id !== this.selectedSlotId);
        this.selectedSlotId = null;
        this.selectedSlot = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.bookingLoading = false;
        this.errorMessage = err?.error?.detail ?? 'Ошибка при бронировании.';
        this.cdr.markForCheck();
      },
    });
  }
}
