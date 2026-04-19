export interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
  is_staff: boolean;
  is_tutor: boolean;
}
