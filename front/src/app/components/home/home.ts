import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface TutorRow {
  id: number;
  name: string;
  subject: string;
  rating: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  /** Full list (source of truth for filtering). */
  readonly allTutors: TutorRow[] = [
    { id: 1, name: 'John Doe', subject: 'Mathematics', rating: 4.5 },
    { id: 2, name: 'Jane Smith', subject: 'Physics', rating: 4.0 },
    { id: 3, name: 'Almas Magrupov', subject: 'Chemistry', rating: 4.2 },
    { id: 4, name: 'Michael Brown', subject: 'Biology', rating: 4.7 },
    { id: 5, name: 'Alikhan Turugeldiev', subject: 'English', rating: 4.3 },
    { id: 6, name: 'Yertayev Daniyal', subject: 'History', rating: 4.1 },
  ];

  /** Text: matches tutor name or subject (case-insensitive). */
  quickSearch = '';
  /** Empty string = all subjects. */
  subjectFilter = '';
  /** Minimum rating (slider). */
  minRating = 0;

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
    window.alert(
      `Вы выбрали ${tutor.name} — ${tutor.subject}, рейтинг ${tutor.rating}`,
    );
  }
}
