import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { AuthComponent } from './features/auth/auth';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Inicio' },
  { path: 'auth', component: AuthComponent, title: 'Login' },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/orders').then(m => m.Orders)
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/products/products').then(m => m.Products)
  },

  { path: '**', redirectTo: '' }
];
