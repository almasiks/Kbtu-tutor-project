export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';

export interface StoredUser {
  id: number;
  username: string;
  is_staff: boolean;
  is_tutor: boolean;
}
