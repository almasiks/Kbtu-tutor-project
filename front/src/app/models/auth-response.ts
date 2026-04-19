export interface AuthUser {
  id: number;
  username: string;
  email?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
