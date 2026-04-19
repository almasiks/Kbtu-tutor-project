import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';
import type { TutorDetail } from '../../models/tutor';

@Component({
  selector: 'app-tutor-detail',
  standalone: true,
  templateUrl: './tutor.html',
  styleUrl: './tutor.css',
})
export class TutorDetailComponent implements OnInit {
  tutor: TutorDetail | null = null;
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.errorMessage = null;
    const id = this.route.snapshot.paramMap.get('id');
    const numId = id ? Number(id) : NaN;
    if (!Number.isFinite(numId)) {
      this.loading = false;
      this.errorMessage = 'Invalid tutor id.';
      return;
    }
    this.api.getTutor(numId).subscribe({
      next: (t) => {
        this.tutor = t;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Could not load tutor.';
      },
    });
  }

  bookLesson(): void {
    if (!this.tutor) {
      return;
    }
    this.errorMessage =
      'Booking needs a free lesson slot id (POST /api/bookings/ with lesson_slot). Add slot listing or pick a slot in the UI.';
  }
}
