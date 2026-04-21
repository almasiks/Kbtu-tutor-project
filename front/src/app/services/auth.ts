import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private readonly userIdKey = 'user_id';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

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
    if (!this.isBrowser) return;
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.fallbackTokenKey);
    localStorage.removeItem(this.userIdKey);
  }

  private persistTokens(response: LoginResponse): void {
    if (!this.isBrowser) return;
    if (response.access) {
      localStorage.setItem(this.accessTokenKey, response.access);
    } else if (response.token) {
      localStorage.setItem(this.accessTokenKey, response.token);
      localStorage.setItem(this.fallbackTokenKey, response.token);
    }
    if (response.refresh) {
      localStorage.setItem(this.refreshTokenKey, response.refresh);
    }
    const userId = response.user?.id ?? response.user_id;
    if (typeof userId === 'number') {
      localStorage.setItem(this.userIdKey, String(userId));
    }
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.accessTokenKey) ?? localStorage.getItem(this.fallbackTokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUserId(): number | null {
    if (!this.isBrowser) return null;
    const fromStorage = localStorage.getItem(this.userIdKey);
    if (fromStorage) {
      const parsed = Number(fromStorage);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
