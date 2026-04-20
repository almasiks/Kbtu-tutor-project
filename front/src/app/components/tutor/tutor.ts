import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';
import type { TutorDetail } from '../../models/tutor';
import type { TutorProfileDto } from '../../models/tutor-profile.dto';

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
    this.api.getTutorProfile(numId).subscribe({
      next: (dto) => {
        this.tutor = this.mapProfileToDetail(dto);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Could not load tutor.';
      },
    });
  }

  private mapProfileToDetail(d: TutorProfileDto): TutorDetail {
    return {
      id: d.id,
      name: d.user?.username ?? '—',
      subject: d.subject?.name ?? 'Без предмета',
      rating: Number(d.rating) || 0,
      bio: d.bio || undefined,
      price: Number(d.hourly_rate) || 0,
      experience: d.experience_years,
      image: null,
    };
  }

  bookLesson(): void {
    if (!this.tutor) {
      return;
    }
    this.errorMessage =
      'Бронирование: нужен свободный слот (POST /api/bookings/ с полем lesson_slot). Добавьте выбор слота в UI.';
  }
}
