import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  goToAuthOrProfile(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
      return;
    }
    this.router.navigate(['/login']);
  }
}
