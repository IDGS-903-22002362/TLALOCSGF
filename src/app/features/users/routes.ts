import { Routes } from '@angular/router';
import { authGuard }    from '../../core/guards/auth-guard';
import { UserListComponent }  from './user-list/user-list';
import { UserDetailComponent } from './user-detail/user-detail';
import { UserFormComponent}   from './user-form/user-form';

/** Rutas cargadas perezosamente desde /app.routes.ts  */
export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],          // solo admins
    children: [
      { path: '',          component: UserListComponent,   title: 'Usuarios' },
      { path: ':id',       component: UserDetailComponent, title: 'Detalle de usuario' },
      { path: ':id/edit',  component: UserFormComponent,   title: 'Editar usuario' }
    ]
  }
];
