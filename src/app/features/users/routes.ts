import { Routes } from '@angular/router';
import { UsersListComponent } from './users-list';

export const USER_ROUTES: Routes = [
  { path: '', component: UsersListComponent, title: 'Usuarios' },
];