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
  user?: {
    id: number;
    username: string;
    email: string;
    role?: string;
  };
  user_id: number;
  username: string;
}

export interface BookingItem {
  id: number;
  tutor: number;
  tutor_name: string;
  tutor_subject: string;
  tutor_hourly_rate: string;
  student: number;
  student_username: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface BookingPayload {
  tutor: number;
  date: string; // ISO datetime string
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export interface TutorProfilePayload {
  subject_id: number;
  experience_years: number;
  bio: string;
  hourly_rate: number;
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
    return this.http.get<TutorDetail>(`${this.baseUrl}/tutors/${id}/`).pipe(timeout(4000));
  }

  login(credentials: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login/`, credentials).pipe(timeout(4000));
  }

  register(data: RegisterPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/register/`, data).pipe(timeout(4000));
  }

  createBooking(payload: BookingPayload): Observable<BookingItem> {
    return this.http.post<BookingItem>(`${this.baseUrl}/bookings/`, payload).pipe(timeout(4000));
  }

  getMyBookings(): Observable<BookingItem[]> {
    return this.http.get<BookingItem[]>(`${this.baseUrl}/my-bookings/`).pipe(timeout(4000));
  }

  rateTutor(tutorId: number, score: number): Observable<{ rating: string }> {
    return this.http.post<{ rating: string }>(`${this.baseUrl}/tutors/${tutorId}/rate/`, { score }).pipe(timeout(4000));
  }

  getMyProfile(): Observable<TutorDetail> {
    return this.http.get<TutorDetail>(`${this.baseUrl}/tutors/profile/`).pipe(timeout(4000));
  }

  getTutorsBySubject(subjectId: string | number): Observable<TutorDetail[]> {
    return this.http.get<TutorDetail[]>(`${this.baseUrl}/tutors/?subject=${subjectId}`).pipe(timeout(4000));
  }

  createTutorProfile(payload: TutorProfilePayload): Observable<TutorDetail> {
    return this.http.post<TutorDetail>(`${this.baseUrl}/tutors/create/`, payload).pipe(timeout(4000));
  }
}
