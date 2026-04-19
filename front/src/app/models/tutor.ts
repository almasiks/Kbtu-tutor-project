export interface Tutor {
  id: number;
  name: string;
  subject: string;
  rating: number;
}

export interface TutorDetail extends Tutor {
  bio?: string;
  price?: number;
  experience?: number;
  image?: string | null;
}
