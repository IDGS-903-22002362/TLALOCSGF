import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home';
import { authGuard }     from './core/guards/auth-guard';

/**
 *  🔑  Rutas principales de la aplicación
 *  - Todas las vistas privadas van con `canActivate: [authGuard]`.
 *  - El módulo de autenticación se carga lazy y contiene /login y /register.
 *  - Ejemplo de protección por rol en la sección de usuarios (`data.roles`).
 */
export const routes: Routes = [
  /* ───── Público ───── */
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
    title: 'Inicio'
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  /* ───── Privado ───── */
  {
    path: 'dashboard',
    title: 'Dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.Dashboard)
  },

  {
    path: 'orders',
    title: 'Pedidos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/orders').then(m => m.Orders)
  },

  {
    path: 'products',
    title: 'Productos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/products/products').then(m => m.ProductsListComponent)
  },

  /* Solo Admin (ejemplo de roles) */
  {
    path: 'users',
    title: 'Usuarios',
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
    loadChildren: () =>
      import('./features/users/routes').then(m => m.USER_ROUTES)
  },
  {
  path: 'requests',
  title: 'Solicitudes',
  canActivate: [authGuard],
  data: { roles: ['Admin'] },
  loadComponent: () => import('./features/requests/requests').then(c => c.RequestsComponent)
},
  {
  path: 'quotes',
  loadChildren: () =>
    import('./features/quotes/quotes.routes').then(m => m.QUOTE_ROUTES)
},
{
  path: 'profile',
  title: 'Mi perfil',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/profile/profile').then(m => m.ProfileComponent)
},
{
  path: 'support',
  loadChildren: () => import('./features/support/routes').then(m => m.SUPPORT_ROUTES)
},

  /* Fallback */
  { path: '**', redirectTo: '' }
];
