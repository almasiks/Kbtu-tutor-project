import { CommonModule } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ApiService, TutorDetail } from '../../services/api.service';

interface TutorCard {
  id: number;
  name: string;
  subject: string;
  rating: number;
  experience: number;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  tutors: TutorCard[] = [];
  filteredTutors: TutorCard[] = [];
  isLoading = false;
  showToast = false;

  searchQuery = '';
  selectedSubject = 'all';
  minRating = 0;

  readonly maxStars = 5;
  readonly skeletonCards = [1, 2, 3];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.refreshFromServer('initial-load');
  }

  get subjects(): string[] {
    return Array.from(new Set(this.tutors.map((tutor) => tutor.subject)));
  }

  applyFilter(): void {
    const normalized = this.searchQuery.trim().toLowerCase();
    this.filteredTutors = this.tutors.filter((tutor) => {
      const matchesQuery =
        normalized.length === 0 ||
        tutor.name.toLowerCase().includes(normalized) ||
        tutor.subject.toLowerCase().includes(normalized);
      const matchesSubject = this.selectedSubject === 'all' || tutor.subject === this.selectedSubject;
      const matchesRating = tutor.rating >= this.minRating;
      return matchesQuery && matchesSubject && matchesRating;
    });
  }

  resetFilter(): void {
    this.searchQuery = '';
    this.selectedSubject = 'all';
    this.minRating = 0;
    this.applyFilter();
  }

  refreshFromServer(runId: string = 'run-1'): void {
    this.isLoading = true;
    this.showToast = false;
    this.apiService.getTutors().subscribe({
      next: (tutors) => {
        this.tutors = tutors.map((tutor: TutorDetail) => ({
          id: tutor.id,
          name: tutor.user?.username ?? 'Unknown tutor',
          subject: tutor.subject?.name ?? 'Без предмета',
          rating: Number(tutor.rating ?? 0),
          experience: Number(tutor.experience_years ?? 0),
        }));
        this.applyFilter();
        this.isLoading = false;
        this.showToast = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.showToast = false;
        console.error('Failed to load tutors from backend', error);
        alert('Не удалось загрузить репетиторов с сервера.');
      },
    });
  }

  selectTutor(tutorId: number): void {
    // #region agent log
    fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ba5ba2'},body:JSON.stringify({sessionId:'ba5ba2',runId:'pre-fix',hypothesisId:'H1',location:'home.ts:95',message:'selectTutor called from button click',data:{tutorId,isLoading:this.isLoading},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    this.router.navigate(['/tutor', tutorId]).then((ok) => {
      // #region agent log
      fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ba5ba2'},body:JSON.stringify({sessionId:'ba5ba2',runId:'pre-fix',hypothesisId:'H2',location:'home.ts:98',message:'router.navigate resolved',data:{tutorId,navigationOk:ok},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }).catch((error) => {
      // #region agent log
      fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ba5ba2'},body:JSON.stringify({sessionId:'ba5ba2',runId:'pre-fix',hypothesisId:'H3',location:'home.ts:102',message:'router.navigate rejected',data:{tutorId,errorMessage:error?.message ?? 'unknown'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    });
  }

  getStars(rating: number): boolean[] {
    const filled = Math.round(rating);
    return Array.from({ length: this.maxStars }, (_, index) => index < filled);
  }
}
