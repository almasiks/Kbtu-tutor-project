
export interface LessonSlotInBookingDto {
  id: number;
  tutor: number;
  tutor_username?: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}


export interface BookingDto {
  id: number;
  student: number;
  student_username?: string;
  lesson_slot: number;
  lesson_slot_detail?: LessonSlotInBookingDto;
  created_at: string;
  status: string;
}
