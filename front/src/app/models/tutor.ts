export interface TutorUser {
  id: number;
  username: string;
  email: string;
}

export interface TutorSubject {
  id: number;
  name: string;
  description: string;
}

export interface TutorProfile {
  id: number;
  user: TutorUser;
  subject: TutorSubject | null;
  experience_years: number;
  bio: string;
  hourly_rate: string;
  rating: string;
}

export interface TutorRow {
  id: number;
  name: string;
  subject: string;
  rating: number;
}
