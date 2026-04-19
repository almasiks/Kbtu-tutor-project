import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { TutorRow } from '../../models/tutor';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  allTutors: TutorRow[] = [];
  quickSearch = '';
  subjectFilter = '';
  minRating = 0;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.api.getTutors().subscribe({
      next: (tutors) => {
        this.allTutors = tutors.map((t) => ({
          id: t.id,
          name: t.user.username,
          subject: t.subject?.name ?? 'Без предмета',
          rating: parseFloat(t.rating) || 0,
        }));
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  get subjectOptions(): string[] {
    return [...new Set(this.allTutors.map((t) => t.subject))].sort((a, b) =>
      a.localeCompare(b),
    );
  }

  get minRatingValue(): number {
    const n = Number(this.minRating);
    return Number.isFinite(n) ? n : 0;
  }

  get filteredTutors(): TutorRow[] {
    const q = this.quickSearch.trim().toLowerCase();
    const min = this.minRatingValue;
    return this.allTutors.filter((t) => {
      if (q) {
        const inName = t.name.toLowerCase().includes(q);
        const inSubject = t.subject.toLowerCase().includes(q);
        if (!inName && !inSubject) return false;
      }
      if (this.subjectFilter && t.subject !== this.subjectFilter) return false;
      if (t.rating < min) return false;
      return true;
    });
  }

  resetFilters(): void {
    this.quickSearch = '';
    this.subjectFilter = '';
    this.minRating = 0;
  }

  onSearch(): void {
    document
      .getElementById('tutor-results')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  selectTutor(tutor: TutorRow): void {
    this.router.navigate(['/tutor', tutor.id]);
  }
}
