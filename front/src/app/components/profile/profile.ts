import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService, BookingItem } from '../../services/api.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  bookings: BookingItem[] = [];
  userId: number | null = null;

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    // #region agent log
    fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ba5ba2'},body:JSON.stringify({sessionId:'ba5ba2',runId:'feature-book-rate',hypothesisId:'H5',location:'profile.ts:18',message:'Profile init and load bookings',data:{userId:this.userId},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    this.apiService.getMyBookings().subscribe({
      next: (items) => {
        this.bookings = items;
      },
    });
  }
}
