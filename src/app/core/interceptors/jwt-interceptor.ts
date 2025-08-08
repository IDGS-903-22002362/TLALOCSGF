import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { AuthService } from '../services/auth';

/* ─── Control de refresco global ─── */
let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

/* ─────────────────────────────────── */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  /* Endpoints públicos: sin token */
  if (/\/auth\/(login|register|refresh)$/i.test(req.url)) {
    return next(req);
  }

  /* Adjunta token si existe */
  const token   = localStorage.getItem('token');
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }

      /* No hay refresh-token → logout forzado */
      const refreshToken = localStorage.getItem('refresh');
      if (!refreshToken) {
        auth.logout().subscribe();
        router.navigateByUrl('/auth');
        return throwError(() => err);
      }

      /* Ya hay un refresh en curso → esperar */
      if (isRefreshing) {
        return refreshSubject.pipe(
          filter(t => t !== null),
          take(1),
          switchMap(t =>
            next(authReq.clone({ setHeaders: { Authorization: `Bearer ${t!}` } }))
          )
        );
      }

      /* ─── Iniciar refresh ─── */
      isRefreshing = true;
      refreshSubject.next(null);

      return auth.refresh().pipe(
        switchMap(() => {
          const newToken = localStorage.getItem('token')!;
          isRefreshing = false;
          refreshSubject.next(newToken);

          return next(
            authReq.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
          );
        }),
        catchError(e => {
          isRefreshing = false;
          auth.logout().subscribe();
          router.navigateByUrl('/auth');
          return throwError(() => e);
        })
      );
    })
  );
};
