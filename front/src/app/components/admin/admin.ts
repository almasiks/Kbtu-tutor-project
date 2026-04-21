import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_tutor: boolean;
  is_staff: boolean;
  is_active: boolean;
}

interface Subject {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  activeTab: 'users' | 'subjects' | 'register' = 'users';

  users: AdminUser[] = [];
  usersLoading = true;
  usersError: string | null = null;
  togglingId: number | null = null;

  subjects: Subject[] = [];
  subjectsLoading = true;
  subjectsError: string | null = null;
  newSubjectName = '';
  newSubjectDesc = '';
  addingSubject = false;
  deletingSubjectId: number | null = null;

  regUsername = '';
  regEmail = '';
  regPassword = '';
  regLoading = false;
  regError: string | null = null;
  regSuccess: string | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.api.getUser();
    if (!user?.is_staff) {
      this.router.navigate(['/']);
      return;
    }
    this.loadUsers();
    this.loadSubjects();
  }

  setTab(tab: 'users' | 'subjects' | 'register'): void {
    this.activeTab = tab;
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  loadUsers(): void {
    this.usersLoading = true;
    this.usersError = null;
    this.api.adminGetUsers().subscribe({
      next: (u) => {
        this.users = u;
        this.usersLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.usersError = 'Не удалось загрузить пользователей.';
        this.usersLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  toggleTutor(user: AdminUser): void {
    this.togglingId = user.id;
    this.api.adminSetTutor(user.id, !user.is_tutor).subscribe({
      next: (updated) => {
        user.is_tutor = updated.is_tutor;
        this.togglingId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.togglingId = null;
        this.cdr.markForCheck();
      },
    });
  }

  // ─── Subjects ────────────────────────────────────────────────────────────

  loadSubjects(): void {
    this.subjectsLoading = true;
    this.subjectsError = null;
    this.api.getSubjects().subscribe({
      next: (s) => {
        this.subjects = s;
        this.subjectsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.subjectsError = 'Не удалось загрузить предметы.';
        this.subjectsLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  addSubject(): void {
    if (!this.newSubjectName.trim()) return;
    this.addingSubject = true;
    this.api.createSubject({ name: this.newSubjectName.trim(), description: this.newSubjectDesc.trim() }).subscribe({
      next: (s) => {
        this.subjects = [...this.subjects, s];
        this.newSubjectName = '';
        this.newSubjectDesc = '';
        this.addingSubject = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.addingSubject = false;
        this.cdr.markForCheck();
      },
    });
  }

  deleteSubject(subject: Subject): void {
    if (!confirm(`Удалить предмет «${subject.name}»?`)) return;
    this.deletingSubjectId = subject.id;
    this.api.deleteSubject(subject.id).subscribe({
      next: () => {
        this.subjects = this.subjects.filter((s) => s.id !== subject.id);
        this.deletingSubjectId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.deletingSubjectId = null;
        this.cdr.markForCheck();
      },
    });
  }

  // ─── Register tutor ──────────────────────────────────────────────────────

  registerTutor(): void {
    if (!this.regUsername || !this.regEmail || !this.regPassword) return;
    this.regLoading = true;
    this.regError = null;
    this.regSuccess = null;
    this.api.adminRegisterTutor({ username: this.regUsername, email: this.regEmail, password: this.regPassword }).subscribe({
      next: (res) => {
        this.regSuccess = `Тьютор «${res.username}» успешно зарегистрирован.`;
        this.regUsername = '';
        this.regEmail = '';
        this.regPassword = '';
        this.regLoading = false;
        this.cdr.markForCheck();
        this.loadUsers();
      },
      error: (err) => {
        this.regError = err?.error?.detail ?? 'Ошибка при регистрации.';
        this.regLoading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
