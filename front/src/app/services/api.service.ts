import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export interface TutorSubject {
  id: number;
  name: string;
  description: string;
}

export interface TutorUser {
  id: number;
  username: string;
  email: string;
}

export interface TutorDetail {
  id: number;
  user: TutorUser;
  subject: TutorSubject | null;
  experience_years: number;
  bio: string;
  hourly_rate: string;
  rating: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  is_tutor?: boolean;
}

export interface LoginResponse {
  token?: string;
  access?: string;
  refresh?: string;
  user_id: number;
  username: string;
}

export interface BookingPayload {
  lesson_slot: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://127.0.0.1:8000/api';

  getTutors(): Observable<TutorDetail[]> {
    return this.http.get<TutorDetail[]>(`${this.baseUrl}/tutors/`).pipe(timeout(4000));
  }

  getTutorById(id: number): Observable<TutorDetail> {
    return this.http.get<TutorDetail>(`${this.baseUrl}/tutors/profile/${id}/`).pipe(timeout(4000));
  }

  login(credentials: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login/`, credentials).pipe(timeout(4000));
  }

  register(data: RegisterPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/register/`, data).pipe(timeout(4000));
  }

  bookSlot(slotId: number): Observable<unknown> {
    const payload: BookingPayload = { lesson_slot: slotId };
    return this.http.post<unknown>(`${this.baseUrl}/bookings/`, payload).pipe(timeout(4000));
  }

  getMyProfile(): Observable<TutorDetail> {
    return this.http.get<TutorDetail>(`${this.baseUrl}/tutors/profile/`).pipe(timeout(4000));
  }
}
