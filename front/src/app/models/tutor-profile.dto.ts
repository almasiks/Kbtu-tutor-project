

export interface TutorProfileUserDto {
  id: number;
  username: string;
  email?: string;
}

export interface TutorProfileSubjectDto {
  id: number;
  name: string;
  description?: string;
}

export interface TutorProfileDto {
  id: number;
  user: TutorProfileUserDto;
  subject: TutorProfileSubjectDto | null;
  subject_id?: number | null;
  experience_years: number;
  bio: string;
  hourly_rate: string;
  rating: string;
  is_available?: boolean;
}
