import { HttpInterceptorFn } from '@angular/common/http';
import { AUTH_TOKEN_KEY } from '../auth/auth-storage';

/**
 * Django REST Token auth: Authorization: Token <key>.
 * Login/register requests are left without a token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login/') || req.url.includes('/auth/register/')) {
    return next(req);
  }
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Token ${token}` },
    });
  }
  return next(req);
};
