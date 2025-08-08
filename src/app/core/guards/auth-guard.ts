import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

/*  data: { roles: ['Admin','Manager'] }  -> protección por rol  */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  /* No logueado → login */
  if (!auth.isLoggedIn()) {
    router.navigate(['/auth']);
    return false;
  }

  /* Verificación de roles (opcional) */
  const allowed = route.data?.['roles'] as string[] | undefined;
  if (allowed && !allowed.some(r => auth.roles.includes(r))) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
