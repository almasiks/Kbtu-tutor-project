import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService, LoginPayload, LoginResponse, RegisterPayload } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly fallbackTokenKey = 'token';

  login(credentials: LoginPayload): Observable<LoginResponse> {
    return this.apiService.login(credentials).pipe(
      tap((response) => this.persistTokens(response)),
    );
  }

  register(payload: RegisterPayload): Observable<LoginResponse> {
    return this.apiService.register(payload).pipe(
      tap((response) => this.persistTokens(response)),
    );
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.fallbackTokenKey);
  }

  private persistTokens(response: LoginResponse): void {
    // Backend may return DRF token or JWT pair; keep both compatibility paths.
    if (response.access) {
      localStorage.setItem(this.accessTokenKey, response.access);
    } else if (response.token) {
      localStorage.setItem(this.accessTokenKey, response.token);
      localStorage.setItem(this.fallbackTokenKey, response.token);
    }

    if (response.refresh) {
      localStorage.setItem(this.refreshTokenKey, response.refresh);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey) ?? localStorage.getItem(this.fallbackTokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/']);
};
