import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // 1) Si no hay sesión → login
  if (!auth.isLoggedIn()) {
    router.navigate(['/auth']);
    return false;
  }

  // 2) Chequeo de roles declarados en la ruta
  const allowed = route.data?.['roles'] as string[] | undefined;
  if (allowed) {
    console.log('Roles requeridos por la ruta:', allowed);
  console.log('Roles actuales del usuario:', auth.roles);
    const userRoles = auth.roles.map(r => r.toLowerCase());
    const ok = allowed.some(r => userRoles.includes(r.toLowerCase()));
    if (!ok) {
      router.navigate(['/']); // o a una página 403 si tienes
      return false;
    }
  }

  return true;
};
