import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, StoredUser } from '../auth/auth-storage';
import { AuthResponse } from '../models/auth-response';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api';

  private currentUserSubject = new BehaviorSubject<StoredUser | null>(this._loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login/`, credentials).pipe(
      tap((res) => this._saveSession(res)),
    );
  }

  register(data: { username: string; email: string; password: string; is_tutor?: boolean }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register/`, data).pipe(
      tap((res) => this._saveSession(res)),
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/logout/`, {}).pipe(
      tap(() => this._clearSession()),
    );
  }

  getTutors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tutors/`);
  }

  getTutor(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tutors/profile/${id}/`);
  }

  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tutors/profile/`);
  }

  patchMyProfile(data: Partial<{ bio: string; experience_years: number; hourly_rate: number; subject_id: number | null }>): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/tutors/profile/`, data);
  }

  getTutorSlots(tutorProfileId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tutors/${tutorProfileId}/slots/`);
  }

  getMySlots(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/slots/`);
  }

  createSlot(data: { start_time: string; end_time: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/slots/`, data);
  }

  deleteSlot(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/slots/${id}/`);
  }

  getSubjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/subjects/`);
  }

  createSubject(data: { name: string; description: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/subjects/`, data);
  }

  deleteSubject(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/subjects/${id}/`);
  }

  createBooking(lessonSlotId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/bookings/`, { lesson_slot: lessonSlotId });
  }

  getMyBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/bookings/`);
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/bookings/${bookingId}/`, { status: 'Cancelled' });
  }

  completeBooking(bookingId: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/bookings/${bookingId}/`, { status: 'Completed' });
  }

  submitRating(bookingId: number, score: number, comment: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ratings/`, { booking: bookingId, score, comment });
  }

  adminGetUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/users/`);
  }

  adminSetTutor(userId: number, isTutor: boolean): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/admin/users/${userId}/`, { is_tutor: isTutor });
  }

  adminRegisterTutor(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/register/`, { ...data, is_tutor: true });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  }

  getUser(): StoredUser | null {
    return this.currentUserSubject.value;
  }

  private _saveSession(res: AuthResponse): void {
    localStorage.setItem(AUTH_TOKEN_KEY, res.token);
    const user: StoredUser = { id: res.user_id, username: res.username, is_staff: res.is_staff, is_tutor: res.is_tutor };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private _clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.currentUserSubject.next(null);
  }

  private _loadUser(): StoredUser | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
