import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, switchMap, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth = inject(AuthService);
  const token = localStorage.getItem('token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return auth.refresh().pipe(
          switchMap(() => {
            const newToken = localStorage.getItem('token');
            const retry = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(retry);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
