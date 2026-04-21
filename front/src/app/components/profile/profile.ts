import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { ApiService, BookingItem } from '../../services/api.service';
import { AuthService } from '../../services/auth';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  bookings: BookingItem[] = [];
  isLoading = true;
  toast: { message: string; success: boolean } | null = null;
  username = '';

  readonly statusLabels: Record<string, string | undefined> = {
    pending:   'Ожидает',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const msg = window.history.state?.['toast'] as string | undefined;
      if (msg) { this.showToast(msg, true); }
    }
    this.apiService.getMyBookings().subscribe({
      next: (items) => {
        this.bookings = items;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/';
  }

  private showToast(message: string, success: boolean): void {
    this.toast = { message, success };
    setTimeout(() => (this.toast = null), 4000);
  }
}
