// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { authGuard }     from './core/guards/auth-guard';

export const routes: Routes = [
  /* ===== Fuera del shell (sin navbar) ===== */
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
    title: 'Inicio'
  },
  {
    path: 'quotes',
    loadChildren: () =>
      import('./features/quotes/quotes.routes').then(m => m.QUOTE_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  /* ===== Shell con navbar ===== */
  {
    path: '',
    loadComponent: () =>
      import('./layouts/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        canActivate: [authGuard],
        // Asegúrate que el componente exportado se llama `Dashboard`
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
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
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/products/products').then(m => m.ProductsListComponent)
      },
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
        loadComponent: () =>
          import('./features/requests/requests').then(c => c.RequestsComponent)
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
        loadChildren: () =>
          import('./features/support/routes').then(m => m.SUPPORT_ROUTES)
      },
      {
        path: 'reports',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        loadChildren: () =>
          import('./features/reports/routes').then(m => m.REPORTS_ROUTES)
      },
      {
        path: 'suppliers',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/suppliers/suppliers').then(m => m.Suppliers)
      },
      {
        path: 'inventory',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/inventory/inventory').then(m => m.Inventory)
      },
      {
        path: 'purchases',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/purchases/purchases').then(m => m.PurchasesComponent)
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/support/contact').then(m => m.ContactComponent)
      },
    ]
  },

  /* Fallback */
  { path: '**', redirectTo: '' }
];
