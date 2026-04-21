import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, TutorDetail } from '../../services/api.service';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-subject-tutors',
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './subject-tutors.html',
  styleUrl: './subject-tutors.css',
})
export class SubjectTutors implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);

  tutors: TutorDetail[] = [];
  filtered: TutorDetail[] = [];
  subjectName = '';
  isLoading = false;

  minPrice = 0;
  maxPrice = 99999;
  selectedFormat: 'all' | 'online' | 'offline' = 'all';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    if (isPlatformBrowser(this.platformId)) {
      this.subjectName = (window.history.state?.['subjectName'] as string) ?? '';
    }

    this.isLoading = true;
    this.apiService.getTutorsBySubject(id).subscribe({
      next: (data) => {
        console.log('getTutorsBySubject response:', data);
        const list = Array.isArray(data) ? data : (data as any)['results'] ?? [];
        this.tutors = list;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('getTutorsBySubject error:', err);
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.filtered = this.tutors.filter((t) => {
      const rate = Number(t.hourly_rate) || 0;
      return rate >= this.minPrice && rate <= this.maxPrice;
    });
  }

  goToTutor(id: number): void {
    this.router.navigate(['/tutor', id]);
  }

  getStars(rating: string): boolean[] {
    const filled = Math.round(Number(rating) || 0);
    return Array.from({ length: 5 }, (_, i) => i < filled);
  }
}
