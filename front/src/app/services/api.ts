import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  type MonoTypeOperatorFunction,
  Observable,
  catchError,
  throwError,
} from 'rxjs';
import type { LoginTokenResponse } from '../models/auth-response';
import type { BookingDto } from '../models/booking.dto';
import type { LoginRequest } from '../models/login-request';
import type { Subject } from '../models/subject';
import type { TutorProfileDto } from '../models/tutor-profile.dto';


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  
  readonly apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private url(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiUrl}${p}`;
  }

  private logAndRethrow<T>(context: string): MonoTypeOperatorFunction<T> {
    return catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        console.error(
          `[ApiService:${context}] HTTP ${err.status ?? '?'} — ${err.statusText || 'error'}`,
          err.url ?? this.apiUrl,
          err.error,
        );
      } else {
        console.error(
          `[ApiService:${context}] Backend unreachable or network error`,
          err,
        );
      }
      return throwError(() => err);
    });
  }


  getSubjects(): Observable<Subject[]> {
    return this.http
      .get<Subject[]>(this.url('/subjects/'))
      .pipe(this.logAndRethrow<Subject[]>('getSubjects'));
  }


  getTutors(params?: { subject?: string }): Observable<TutorProfileDto[]> {
    let httpParams = new HttpParams();
    if (params?.subject) {
      httpParams = httpParams.set('subject', params.subject);
    }
    return this.http
      .get<TutorProfileDto[]>(this.url('/tutors/'), { params: httpParams })
      .pipe(this.logAndRethrow<TutorProfileDto[]>('getTutors'));
  }

  
  login(credentials: LoginRequest): Observable<LoginTokenResponse> {
    return this.http
      .post<LoginTokenResponse>(this.url('/auth/login/'), credentials)
      .pipe(this.logAndRethrow<LoginTokenResponse>('login'));
  }


  getTutorProfile(id: number): Observable<TutorProfileDto> {
    return this.http
      .get<TutorProfileDto>(this.url(`/tutors/profile/${id}/`))
      .pipe(this.logAndRethrow<TutorProfileDto>('getTutorProfile'));
  }


  createBooking(lessonSlotId: number): Observable<BookingDto> {
    return this.http
      .post<BookingDto>(this.url('/bookings/'), {
        lesson_slot: lessonSlotId,
      })
      .pipe(this.logAndRethrow<BookingDto>('createBooking'));
  }
}
