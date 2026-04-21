import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, TutorDetail } from '../../services/api.service';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';

interface SubjectItem {
  id: number;
  name: string;
  icon: string;
  faHint: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  tutors: TutorDetail[] = [];
  filteredTutors: TutorDetail[] = [];
  isLoading = false;
  ratingInProgress: number | null = null;

  searchQuery = '';
  selectedSubject = '';

  readonly maxStars = 5;
  readonly subjectItems: SubjectItem[] = [
    { id: 1,  name: 'Web Разработка', icon: '</>', faHint: 'fa-code' },
    { id: 2,  name: 'Академический казахский язык (B2)', icon: 'Aқ', faHint: 'fa-language' },
    { id: 3,  name: 'Введение в машинное обучение', icon: 'AI', faHint: 'fa-brain' },
    { id: 4,  name: 'ИТ инфраструктура и Компьютерные сети', icon: 'NET', faHint: 'fa-network-wired' },
    { id: 5,  name: 'Объектно-ориентированное программирование и дизайн', icon: 'OOP', faHint: 'fa-object-group' },
    { id: 6,  name: 'Физическая культура', icon: 'RUN', faHint: 'fa-running' },
    { id: 7,  name: 'Алгоритмы и структуры данных', icon: 'DS', faHint: 'fa-database' },
    { id: 8,  name: 'Архитектура компьютерных систем', icon: 'CPU', faHint: 'fa-microchip' },
    { id: 9,  name: 'Базы данных', icon: 'SQL', faHint: 'fa-table' },
    { id: 10, name: 'Принципы программирования I/II', icon: 'CODE', faHint: 'fa-laptop-code' },
    { id: 11, name: 'Статистика', icon: 'STAT', faHint: 'fa-chart-bar' },
    { id: 12, name: 'Дискретные структуры', icon: 'DISC', faHint: 'fa-project-diagram' },
    { id: 13, name: 'Иностранный язык (английский B2)', icon: 'EN', faHint: 'fa-american-sign-language-interpreting' },
    { id: 14, name: 'Исчисление 1/2', icon: '∫', faHint: 'fa-square-root-alt' },
    { id: 15, name: 'Модуль социально-политических знаний', icon: 'SP', faHint: 'fa-landmark' },
    { id: 16, name: 'Философия', icon: 'Φ', faHint: 'fa-book-reader' },
    { id: 17, name: 'Информационно-коммуникационные технологии', icon: 'ICT', faHint: 'fa-satellite-dish' },
    { id: 18, name: 'История Казахстана', icon: 'KZ', faHint: 'fa-history' },
    { id: 19, name: 'Линейная алгебра для инженеров', icon: 'LA', faHint: 'fa-vector-square' },
  ];

  ngOnInit(): void {
    this.refreshFromServer();
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token') || !!localStorage.getItem('token');
  }

  applyFilter(): void {
    const normalized = this.searchQuery.trim().toLowerCase();
    this.filteredTutors = this.tutors.filter((tutor) => {
      const subject = tutor.subject?.name ?? '';
      const matchesQuery =
        normalized.length === 0 ||
        tutor.user.username.toLowerCase().includes(normalized) ||
        subject.toLowerCase().includes(normalized);
      const matchesSubject = !this.selectedSubject || subject === this.selectedSubject;
      return matchesQuery && matchesSubject;
    });
  }

  filterBySubject(subject: string): void {
    this.selectedSubject = this.selectedSubject === subject ? '' : subject;
    this.applyFilter();
  }

  goToSubject(item: SubjectItem): void {
    this.router.navigate(['/tutors/subject', item.id], { state: { subjectName: item.name } });
  }

  refreshFromServer(): void {
    this.isLoading = true;
    this.apiService.getTutors().subscribe({
      next: (tutors) => {
        this.tutors = tutors;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  selectTutor(tutorId: number): void {
    this.router.navigate(['/tutor', tutorId]);
  }

  rateTutor(tutorId: number, rating: number): void {
    this.ratingInProgress = tutorId;
    this.apiService.rateTutor(tutorId, rating).subscribe({
      next: () => {
        this.ratingInProgress = null;
        this.refreshFromServer();
      },
      error: () => {
        this.ratingInProgress = null;
      },
    });
  }

  getStars(ratingValue: string): boolean[] {
    const rating = Number(ratingValue) || 0;
    const filled = Math.round(rating);
    return Array.from({ length: this.maxStars }, (_, index) => index < filled);
  }
}
