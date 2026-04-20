import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  // #region agent log
  fetch('http://127.0.0.1:7769/ingest/3cf38c3b-67dc-4a61-ac97-c68afdef46a4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b74f88'},body:JSON.stringify({sessionId:'b74f88',runId:'run-3',hypothesisId:'H10',location:'auth.ts:authInterceptor',message:'Outgoing HTTP request intercepted',data:{url:req.url,hasToken:!!token},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
