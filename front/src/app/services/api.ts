import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError, type MonoTypeOperatorFunction } from 'rxjs';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, StoredUser } from '../auth/auth-storage';
import type { AuthResponse } from '../models/auth-response';
import type { BookingDto, LessonSlotInBookingDto } from '../models/booking.dto';
import type { LoginRequest } from '../models/login-request';
import type { Subject } from '../models/subject';
import type { TutorProfile } from '../models/tutor';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api';
  private readonly currentUserSubject = new BehaviorSubject<StoredUser | null>(this.loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private url(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${p}`;
  }

  private logAndRethrow<T>(context: string): MonoTypeOperatorFunction<T> {
    return catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        console.error(
          `[ApiService:${context}] HTTP ${err.status ?? '?'} - ${err.statusText || 'error'}`,
          err.url ?? this.baseUrl,
          err.error,
        );
      } else {
        console.error(`[ApiService:${context}] Backend unreachable or network error`, err);
      }
      return throwError(() => err);
    });
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.url('/auth/login/'), credentials).pipe(
      tap((res) => this.saveSession(res)),
      this.logAndRethrow<AuthResponse>('login'),
    );
  }

  register(data: {
    username: string;
    email: string;
    password: string;
    is_tutor?: boolean;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.url('/auth/register/'), data).pipe(
      tap((res) => this.saveSession(res)),
      this.logAndRethrow<AuthResponse>('register'),
    );
  }

  logout(): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(this.url('/auth/logout/'), {}).pipe(
      tap(() => this.clearSession()),
      this.logAndRethrow<{ detail: string }>('logout'),
    );
  }

  getSubjects(): Observable<Subject[]> {
    return this.http
      .get<Subject[]>(this.url('/subjects/'))
      .pipe(this.logAndRethrow<Subject[]>('getSubjects'));
  }

  getTutors(params?: { subject?: string }): Observable<TutorProfile[]> {
    let httpParams = new HttpParams();
    if (params?.subject) {
      httpParams = httpParams.set('subject', params.subject);
    }
    return this.http
      .get<TutorProfile[]>(this.url('/tutors/'), { params: httpParams })
      .pipe(this.logAndRethrow<TutorProfile[]>('getTutors'));
  }

  getTutor(id: number): Observable<TutorProfile> {
    return this.http
      .get<TutorProfile>(this.url(`/tutors/profile/${id}/`))
      .pipe(this.logAndRethrow<TutorProfile>('getTutor'));
  }

  getMyProfile(): Observable<TutorProfile> {
    return this.http
      .get<TutorProfile>(this.url('/tutors/profile/'))
      .pipe(this.logAndRethrow<TutorProfile>('getMyProfile'));
  }

  patchMyProfile(
    data: Partial<{
      bio: string;
      experience_years: number;
      hourly_rate: number;
      subject_id: number | null;
    }>,
  ): Observable<TutorProfile> {
    return this.http
      .patch<TutorProfile>(this.url('/tutors/profile/'), data)
      .pipe(this.logAndRethrow<TutorProfile>('patchMyProfile'));
  }

  getTutorSlots(tutorProfileId: number): Observable<LessonSlotInBookingDto[]> {
    return this.http
      .get<LessonSlotInBookingDto[]>(this.url(`/tutors/${tutorProfileId}/slots/`))
      .pipe(this.logAndRethrow<LessonSlotInBookingDto[]>('getTutorSlots'));
  }

  getMySlots(): Observable<LessonSlotInBookingDto[]> {
    return this.http
      .get<LessonSlotInBookingDto[]>(this.url('/slots/'))
      .pipe(this.logAndRethrow<LessonSlotInBookingDto[]>('getMySlots'));
  }

  createSlot(data: { start_time: string; end_time: string }): Observable<LessonSlotInBookingDto> {
    return this.http
      .post<LessonSlotInBookingDto>(this.url('/slots/'), data)
      .pipe(this.logAndRethrow<LessonSlotInBookingDto>('createSlot'));
  }

  deleteSlot(id: number): Observable<void> {
    return this.http
      .delete<void>(this.url(`/slots/${id}/`))
      .pipe(this.logAndRethrow<void>('deleteSlot'));
  }

  createSubject(data: { name: string; description: string }): Observable<Subject> {
    return this.http
      .post<Subject>(this.url('/subjects/'), data)
      .pipe(this.logAndRethrow<Subject>('createSubject'));
  }

  deleteSubject(id: number): Observable<void> {
    return this.http
      .delete<void>(this.url(`/subjects/${id}/`))
      .pipe(this.logAndRethrow<void>('deleteSubject'));
  }

  createBooking(lessonSlotId: number): Observable<BookingDto> {
    return this.http
      .post<BookingDto>(this.url('/bookings/'), { lesson_slot: lessonSlotId })
      .pipe(this.logAndRethrow<BookingDto>('createBooking'));
  }

  getMyBookings(): Observable<BookingDto[]> {
    return this.http
      .get<BookingDto[]>(this.url('/bookings/'))
      .pipe(this.logAndRethrow<BookingDto[]>('getMyBookings'));
  }

  adminGetUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.url('/admin/users/')).pipe(this.logAndRethrow<any[]>('adminGetUsers'));
  }

  adminSetTutor(userId: number, isTutor: boolean): Observable<any> {
    return this.http
      .patch<any>(this.url(`/admin/users/${userId}/`), { is_tutor: isTutor })
      .pipe(this.logAndRethrow<any>('adminSetTutor'));
  }

  adminRegisterTutor(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http
      .post<any>(this.url('/auth/register/'), { ...data, is_tutor: true })
      .pipe(this.logAndRethrow<any>('adminRegisterTutor'));
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  }

  getUser(): StoredUser | null {
    return this.currentUserSubject.value;
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(AUTH_TOKEN_KEY, res.token);
    const user: StoredUser = {
      id: res.user_id,
      username: res.username,
      is_staff: res.is_staff,
      is_tutor: res.is_tutor,
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.currentUserSubject.next(null);
  }

  private loadUser(): StoredUser | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      return raw ? (JSON.parse(raw) as StoredUser) : null;
    } catch {
      return null;
    }
  }
}
