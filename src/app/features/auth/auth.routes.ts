// src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { AuthComponent } from './auth'; // login
import { RequestAccessComponent } from './request-access';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'register', component: RequestAccessComponent }, 
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
