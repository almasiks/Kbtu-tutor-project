import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  password2 = '';
  loading = false;
  error: string | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onSubmit(): void {
    if (!this.username || !this.email || !this.password || !this.password2) {
      return;
    }
    if (this.password !== this.password2) {
      this.error = 'Пароли не совпадают.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.error = null;
    this.api
      .register({
        username: this.username,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.detail ?? 'Не удалось зарегистрироваться.';
          this.cdr.markForCheck();
        },
      });
  }
}
