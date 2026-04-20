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

  ngOnInit(): void {
    // #region agent log
    fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b74f88'},body:JSON.stringify({sessionId:'b74f88',runId:'run-2',hypothesisId:'H9',location:'home.ts:ngOnInit',message:'Home init platform check',data:{isBrowser:isPlatformBrowser(this.platformId)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.refreshFromServer('initial-load');
  }

  get subjects(): string[] {
    return Array.from(new Set(this.tutors.map((tutor) => tutor.subject)));
  }

  applyFilter(): void {
    
    fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b74f88'},body:JSON.stringify({sessionId:'b74f88',runId:'run-1',hypothesisId:'H2',location:'home.ts:applyFilter',message:'Applying local filters',data:{searchQuery:this.searchQuery,selectedSubject:this.selectedSubject,minRating:this.minRating,totalTutors:this.tutors.length},timestamp:Date.now()})}).catch(()=>{});
    
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
    // #region agent log
    fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b74f88'},body:JSON.stringify({sessionId:'b74f88',runId,hypothesisId:'H1',location:'home.ts:refreshFromServer',message:'Starting tutors API request',data:{api:'/api/tutors/'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    this.apiService.getTutors().subscribe({
      next: (tutors) => {
        this.tutors = tutors.map((tutor: TutorDetail) => ({
          id: tutor.id,
          name: tutor.user?.username ?? 'Unknown tutor',
          subject: tutor.subject?.name ?? 'Без предмета',
          rating: Number(tutor.rating ?? 0),
        }));
        this.applyFilter();
        this.isLoading = false;
        this.showToast = true;
        // #region agent log
        fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b74f88'},body:JSON.stringify({sessionId:'b74f88',runId:'run-3',hypothesisId:'H11',location:'home.ts:refreshFromServer',message:'Tutors API success and mapped',data:{receivedTutors:tutors.length,firstTutorUsername:tutors[0]?.user?.username ?? null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      },
      error: (error) => {
        this.isLoading = false;
        this.showToast = false;
        console.error('Failed to load tutors from backend', error);
        alert('Не удалось загрузить репетиторов с сервера.');
        // #region agent log
        fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b74f88'},body:JSON.stringify({sessionId:'b74f88',runId:'run-3',hypothesisId:'H12',location:'home.ts:refreshFromServer',message:'Tutors API failed or timed out',data:{api:'http://127.0.0.1:8000/api/tutors/',errorName:error?.name,errorStatus:error?.status},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      },
    });
  }

  selectTutor(tutorId: number): void {
    // #region agent log
    fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b74f88'},body:JSON.stringify({sessionId:'b74f88',runId:'run-1',hypothesisId:'H3',location:'home.ts:selectTutor',message:'Tutor selection click',data:{tutorId},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    this.router.navigate(['/tutor', tutorId]);
  }

  getStars(rating: number): boolean[] {
    const filled = Math.round(rating);
    return Array.from({ length: this.maxStars }, (_, index) => index < filled);
  }
}
