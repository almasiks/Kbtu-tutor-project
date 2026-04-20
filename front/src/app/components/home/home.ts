import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import type { Tutor } from '../../models/tutor';
import type { TutorProfileDto } from '../../models/tutor-profile.dto';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  /** Populated from `GET /api/tutors/`; falls back to seed if the API fails. */
  allTutors: Tutor[] = [];
  listError: string | null = null;
  listLoadedFromApi = false;
  isLoading = false;

  private readonly seedTutors: Tutor[] = [
    {
      id: 1,
      name: 'John Doe',
      subject: 'Mathematics',
      rating: 4.5,
      isAvailable: true,
    },
    {
      id: 2,
      name: 'Jane Smith',
      subject: 'Physics',
      rating: 4.0,
      isAvailable: false,
    },
    {
      id: 3,
      name: 'Almas Magrupov',
      subject: 'Chemistry',
      rating: 4.2,
      isAvailable: true,
    },
    {
      id: 4,
      name: 'Michael Brown',
      subject: 'Biology',
      rating: 4.7,
      isAvailable: true,
    },
    {
      id: 5,
      name: 'Alikhan Turugeldiev',
      subject: 'English',
      rating: 4.3,
      isAvailable: false,
    },
    {
      id: 6,
      name: 'Yertayev Daniyal',
      subject: 'History',
      rating: 4.1,
      isAvailable: true,
    },
  ];

  quickSearch = '';
  subjectFilter = '';
  minRating = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTutorsFromApi();
  }

  private loadTutorsFromApi(): void {
    this.isLoading = true;
    // #region agent log
    fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'174c49'},body:JSON.stringify({sessionId:'174c49',runId:'pre-fix',hypothesisId:'H1',location:'home.ts:loadTutorsFromApi:start',message:'Started tutors loading',data:{quickSearch:this.quickSearch,subjectFilter:this.subjectFilter,minRating:this.minRating},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    this.api
      .getTutors()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          // #region agent log
          fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'174c49'},body:JSON.stringify({sessionId:'174c49',runId:'pre-fix',hypothesisId:'H1',location:'home.ts:loadTutorsFromApi:finalize',message:'Finished tutors loading',data:{isLoading:this.isLoading,totalTutors:this.allTutors.length},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        }),
      )
      .subscribe({
        next: (profiles) => {
          this.listError = null;
          this.listLoadedFromApi = true;
          this.allTutors = profiles.map((p) => this.mapProfileToTutor(p));
          // #region agent log
          fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'174c49'},body:JSON.stringify({sessionId:'174c49',runId:'pre-fix',hypothesisId:'H2',location:'home.ts:loadTutorsFromApi:next',message:'Tutors loaded from API',data:{profilesCount:profiles.length,mappedCount:this.allTutors.length},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        },
        error: () => {
          this.listError =
            'Не удалось загрузить список с сервера. Показаны демо-данные (проверьте, что Django запущен на порту 8000).';
          this.allTutors = [...this.seedTutors];
          this.listLoadedFromApi = false;
          // #region agent log
          fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'174c49'},body:JSON.stringify({sessionId:'174c49',runId:'pre-fix',hypothesisId:'H2',location:'home.ts:loadTutorsFromApi:error',message:'Tutors API failed, fallback used',data:{fallbackCount:this.allTutors.length},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        },
      });
  }

  private mapProfileToTutor(p: TutorProfileDto): Tutor {
    return {
      id: p.id,
      name: p.user?.username ?? '—',
      subject: p.subject?.name ?? 'Без предмета',
      rating: Number(p.rating) || 0,
      isAvailable: p.is_available ?? (p.id % 2 === 0 ? false : true),
    };
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

  get filteredTutors(): Tutor[] {
    const q = this.quickSearch.trim().toLowerCase();
    const min = this.minRatingValue;
    return this.allTutors.filter((t) => {
      if (q) {
        const inName = t.name.toLowerCase().includes(q);
        const inSubject = t.subject.toLowerCase().includes(q);
        if (!inName && !inSubject) {
          return false;
        }
      }
      if (this.subjectFilter && t.subject !== this.subjectFilter) {
        return false;
      }
      if (t.rating < min) {
        return false;
      }
      return true;
    });
  }

  getSkeletonItems(): number[] {
    return [1, 2, 3, 4, 5, 6];
  }

  getStarStates(rating: number): boolean[] {
    const clampedRating = Math.max(0, Math.min(5, rating));
    return Array.from({ length: 5 }, (_, i) => i < Math.round(clampedRating));
  }

  resetFilters(): void {
    this.quickSearch = '';
    this.subjectFilter = '';
    this.minRating = 0;
  }

  reloadFromApi(): void {
    this.loadTutorsFromApi();
  }

  onMinRatingChange(value: number | string): void {
    const numericValue = Number(value);
    // #region agent log
    fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'174c49'},body:JSON.stringify({sessionId:'174c49',runId:'pre-fix',hypothesisId:'H3',location:'home.ts:onMinRatingChange',message:'Min rating changed',data:{rawValue:value,numericValue,filteredCount:this.filteredTutors.length,totalTutors:this.allTutors.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }

  onSearch(): void {
    document
      .getElementById('tutor-results')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  selectTutor(tutor: Tutor): void {
    window.alert(
      `Вы выбрали ${tutor.name} — ${tutor.subject}, рейтинг ${tutor.rating}`,
    );
  }
}
