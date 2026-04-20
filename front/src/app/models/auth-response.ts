export interface AuthUser {
  id: number;
  username: string;
  email?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}


export interface LoginTokenResponse {
  token: string;
  username: string;
  user_id: number;
}
