import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  /** Django dev server: python manage.py runserver → http://127.0.0.1:8000 */
  private baseUrl = 'http://127.0.0.1:8000/api';
  constructor(private http: HttpClient) {}

  getSubjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/subjects/`);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login/`, credentials);
  }

  getTutor(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tutors/profile/${id}/`);
  }

  /** Backend expects `lesson_slot` = LessonSlot id, not tutor profile id. */
  createBooking(lessonSlotId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/bookings/`, {
      lesson_slot: lessonSlotId,
    });
  }
}
