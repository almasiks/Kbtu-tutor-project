import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import type { StoredUser } from '../../auth/auth-storage';
import type { BookingDto, LessonSlotInBookingDto } from '../../models/booking.dto';
import type { TutorProfileDto } from '../../models/tutor-profile.dto';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  loading = true;
  error: string | null = null;
  storedUser: StoredUser | null = null;
  profile: TutorProfileDto | null = null;

  slotsLoading = false;
  slots: LessonSlotInBookingDto[] = [];
  bookings: BookingDto[] = [];
  deletingSlotId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.storedUser = this.api.getUser();
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;
    if (this.storedUser?.is_tutor) {
      this.api.getMyTutorProfile().subscribe({
        next: (profile) => {
          this.profile = profile;
          this.loading = false;
        },
        error: () => {
          this.error = 'Не удалось загрузить профиль.';
          this.loading = false;
        },
      });
      this.loadMySlots();
    } else {
      this.loading = false;
      this.loadMyBookings();
    }
  }

  private loadMySlots(): void {
    this.slotsLoading = true;
    this.api.getMySlots().subscribe({
      next: (slots) => {
        this.slots = slots;
        this.slotsLoading = false;
      },
      error: () => {
        this.slotsLoading = false;
      },
    });
  }

  private loadMyBookings(): void {
    this.api.getMyBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
      },
      error: () => {
        this.bookings = [];
      },
    });
  }

  slotStatusLabel(slot: LessonSlotInBookingDto): string {
    return slot.is_booked ? 'Занят' : 'Свободен';
  }

  deleteSlot(slot: LessonSlotInBookingDto): void {
    if (slot.is_booked) {
      return;
    }
    this.deletingSlotId = slot.id;
    this.api.deleteSlot(slot.id).subscribe({
      next: () => {
        this.slots = this.slots.filter((s) => s.id !== slot.id);
        this.deletingSlotId = null;
      },
      error: () => {
        this.deletingSlotId = null;
      },
    });
  }

  statusClass(status: string): string {
    const key = status.toLowerCase();
    if (key === 'cancelled') return 'booking-status status-cancelled';
    if (key === 'completed') return 'booking-status status-completed';
    if (key === 'confirmed') return 'booking-status status-confirmed';
    return 'booking-status status-pending';
  }

  statusLabel(status: string): string {
    const key = status.toLowerCase();
    if (key === 'cancelled') return 'Отменено';
    if (key === 'completed') return 'Завершено';
    if (key === 'confirmed') return 'Подтверждено';
    return 'В ожидании';
  }
}
