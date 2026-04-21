import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService, TutorDetail } from '../../services/api.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-tutor-details',
  imports: [CommonModule],
  templateUrl: './tutor-details.html',
  styleUrl: './tutor-details.css',
})
export class TutorDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  readonly tutorId = Number(this.route.snapshot.paramMap.get('id'));
  tutor: TutorDetail | null = null;
  isSubmitting = false;
  bookingNotice = '';
  ratingNotice = '';
  selectedScore = 0;
  readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.loadTutor();
  }

  private loadTutor(): void {
    this.apiService.getTutorById(this.tutorId).subscribe({
      next: (tutor) => {
        this.tutor = tutor;
      },
    });
  }

  bookLesson(): void {
    const userId = this.authService.getCurrentUserId();
    // #region agent log
    fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ba5ba2'},body:JSON.stringify({sessionId:'ba5ba2',runId:'feature-book-rate',hypothesisId:'H1',location:'tutor-details.ts:31',message:'Booking started',data:{tutorId:this.tutorId,userId},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!userId) {
      this.bookingNotice = 'Не удалось определить пользователя.';
      return;
    }
    this.isSubmitting = true;
    this.bookingNotice = '';
    this.apiService.createBooking({
      tutor: this.tutorId,
      date: new Date().toISOString(),
      status: 'pending',
    }).subscribe({
      next: () => {
        this.bookingNotice = 'Успешно забронировано!';
        this.isSubmitting = false;
        // #region agent log
        fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ba5ba2'},body:JSON.stringify({sessionId:'ba5ba2',runId:'feature-book-rate',hypothesisId:'H2',location:'tutor-details.ts:49',message:'Booking success',data:{tutorId:this.tutorId},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      },
      error: () => {
        this.bookingNotice = 'Не удалось забронировать занятие.';
        this.isSubmitting = false;
      },
    });
  }

  rateTutor(score: number): void {
    this.selectedScore = score;
    // #region agent log
    fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ba5ba2'},body:JSON.stringify({sessionId:'ba5ba2',runId:'feature-book-rate',hypothesisId:'H3',location:'tutor-details.ts:66',message:'Rate started',data:{tutorId:this.tutorId,score},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    this.apiService.rateTutor(this.tutorId, score).subscribe({
      next: (response) => {
        if (this.tutor) {
          this.tutor.rating = String(response.rating);
        }
        this.ratingNotice = 'Оценка сохранена!';
        // #region agent log
        fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ba5ba2'},body:JSON.stringify({sessionId:'ba5ba2',runId:'feature-book-rate',hypothesisId:'H4',location:'tutor-details.ts:77',message:'Rate success',data:{tutorId:this.tutorId,newRating:response.rating},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      },
      error: () => {
        this.ratingNotice = 'Не удалось сохранить оценку.';
      },
    });
  }
}
