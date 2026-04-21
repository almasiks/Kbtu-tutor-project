export interface BookLessonResponse {
  id: number;
  tutor_id: number;
  status: string;
}

export interface CancelBookingResponse {
  cancelled: boolean;
  id: number;
}
