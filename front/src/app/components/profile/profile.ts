import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { ApiService } from '../../services/api';
import { StoredUser } from '../../auth/auth-storage';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  storedUser: StoredUser | null = null;
  profile: any = null;
  subjects: any[] = [];
  bookings: any[] = [];

  loading = true;
  error: string | null = null;

  editing = false;
  saving = false;
  saveError: string | null = null;
  form = { bio: '', experience_years: 0, hourly_rate: 0, subject_id: null as number | null };

  slots: any[] = [];
  slotsLoading = false;
  slotStart = '';
  slotEnd = '';
  addingSlot = false;
  slotError: string | null = null;
  deletingSlotId: number | null = null;

  completingBookingId: number | null = null;

  ratingBookingId: number | null = null;
  ratingScore = 0;
  ratingComment = '';
  ratingSubmitting = false;
  ratingError: string | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.api.currentUser$.pipe(take(1)).subscribe((user) => {
      this.storedUser = user;
      if (!user) { this.router.navigate(['/login']); return; }

      this.api.getMyBookings().subscribe({
        next: (b) => { this.bookings = b; this.cdr.markForCheck(); },
        error: () => {},
      });

      if (user.is_tutor) {
        this.api.getSubjects().subscribe({
          next: (s) => { this.subjects = s; this.cdr.markForCheck(); },
          error: () => {},
        });
        this.api.getMyProfile().subscribe({
          next: (p) => {
            this.profile = p;
            this.loading = false;
            this.cdr.markForCheck();
            this.loadSlots();
          },
          error: (err) => {
            this.loading = false;
            this.error = err.status === 404 ? null : 'Не удалось загрузить профиль.';
            this.cdr.markForCheck();
          },
        });
      } else {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  startEdit(): void {
    this.form = {
      bio: this.profile.bio ?? '',
      experience_years: this.profile.experience_years ?? 0,
      hourly_rate: parseFloat(this.profile.hourly_rate) || 0,
      subject_id: this.profile.subject?.id ?? null,
    };
    this.saveError = null;
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    this.saveError = null;
  }

  saveEdit(): void {
    this.saving = true;
    this.saveError = null;
    this.api.patchMyProfile({
      bio: this.form.bio,
      experience_years: Number(this.form.experience_years),
      hourly_rate: Number(this.form.hourly_rate),
      subject_id: this.form.subject_id,
    }).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.editing = false;
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.saveError = 'Не удалось сохранить изменения.';
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadSlots(): void {
    this.slotsLoading = true;
    this.api.getMySlots().subscribe({
      next: (s) => { this.slots = s; this.slotsLoading = false; this.cdr.markForCheck(); },
      error: () => { this.slotsLoading = false; this.cdr.markForCheck(); },
    });
  }

  addSlot(): void {
    if (!this.slotStart || !this.slotEnd) return;
    this.slotError = null;
    this.addingSlot = true;
    this.api.createSlot({
      start_time: this.slotStart,
      end_time: this.slotEnd,
    }).subscribe({
      next: (slot) => {
        this.slots = [...this.slots, slot];
        this.slotStart = '';
        this.slotEnd = '';
        this.addingSlot = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.slotError = err?.error?.non_field_errors?.[0]
          ?? err?.error?.detail
          ?? 'Ошибка при создании слота.';
        this.addingSlot = false;
        this.cdr.markForCheck();
      },
    });
  }

  deleteSlot(slot: any): void {
    this.deletingSlotId = slot.id;
    this.api.deleteSlot(slot.id).subscribe({
      next: () => {
        this.slots = this.slots.filter((s) => s.id !== slot.id);
        this.deletingSlotId = null;
        this.cdr.markForCheck();
      },
      error: () => { this.deletingSlotId = null; this.cdr.markForCheck(); },
    });
  }

  slotStatusLabel(slot: any): string {
    return slot.is_booked ? 'Забронирован' : 'Свободен';
  }

  statusClass(s: string): string {
    if (s === 'Confirmed') return 'status-confirmed';
    if (s === 'Cancelled') return 'status-cancelled';
    if (s === 'Completed') return 'status-completed';
    return '';
  }

  statusLabel(s: string): string {
    if (s === 'Confirmed') return 'Подтверждено';
    if (s === 'Cancelled') return 'Отменено';
    if (s === 'Completed') return 'Завершено';
    return s;
  }

  markCompleted(bookingId: number): void {
    this.completingBookingId = bookingId;
    this.api.completeBooking(bookingId).subscribe({
      next: (updated) => {
        this.bookings = this.bookings.map((b) => b.id === bookingId ? { ...b, ...updated } : b);
        this.completingBookingId = null;
        this.cdr.markForCheck();
      },
      error: () => { this.completingBookingId = null; this.cdr.markForCheck(); },
    });
  }

  openRating(bookingId: number): void {
    this.ratingBookingId = bookingId;
    this.ratingScore = 0;
    this.ratingComment = '';
    this.ratingError = null;
  }

  closeRating(): void {
    this.ratingBookingId = null;
    this.ratingError = null;
  }

  setRatingScore(score: number): void {
    this.ratingScore = score;
  }

  submitRating(): void {
    if (!this.ratingBookingId || this.ratingScore < 1) return;
    this.ratingSubmitting = true;
    this.ratingError = null;
    this.api.submitRating(this.ratingBookingId, this.ratingScore, this.ratingComment).subscribe({
      next: () => {
        this.bookings = this.bookings.map((b) =>
          b.id === this.ratingBookingId ? { ...b, is_rated: true } : b
        );
        this.ratingSubmitting = false;
        this.ratingBookingId = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.ratingError = err?.error?.detail ?? 'Ошибка при отправке оценки.';
        this.ratingSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }
}
