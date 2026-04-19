import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = null;
    this.api.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.loading = false;
        this.error = 'Неверный логин или пароль.';
        this.cdr.markForCheck();
      },
    });
  }
}
