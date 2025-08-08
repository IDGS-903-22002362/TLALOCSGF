import { Routes } from '@angular/router';
import { FaqPublicComponent } from './faq-public';
import { TicketsMyComponent } from './tickets-my';
import { TicketsAdminComponent } from './tickets-admin';
import { TicketDetailComponent } from './ticket-detail';
import { authGuard } from '../../core/guards/auth-guard';

export const SUPPORT_ROUTES: Routes = [
  { path: 'faqs', component: FaqPublicComponent, title: 'Preguntas frecuentes' },

  { path: 'tickets', component: TicketsMyComponent, title: 'Mis tickets', canActivate: [authGuard] },
  { path: 'tickets/:id', component: TicketDetailComponent, title: 'Ticket', canActivate: [authGuard] }, // 👈 detalle

  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: 'tickets', component: TicketsAdminComponent, title: 'Tickets (Admin)' },
      { path: '', pathMatch: 'full', redirectTo: 'tickets' },
    ]
  },

  { path: '', pathMatch: 'full', redirectTo: 'faqs' }
];
