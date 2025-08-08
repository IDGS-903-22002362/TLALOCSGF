import { Routes } from '@angular/router';
import { AuthComponent }     from './auth';     // login existente
import { RegisterComponent } from './register';

export const AUTH_ROUTES: Routes = [
  { path: 'login',    component: AuthComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
