import { HttpInterceptorFn } from '@angular/common/http';
import { AUTH_TOKEN_KEY } from '../auth/auth-storage';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login/')) {
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
