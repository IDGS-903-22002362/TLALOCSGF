import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

import { QuotePickerComponent }  from './quote-picker';
import { QuoteDetailComponent }  from './quote-detail';

export const QUOTE_ROUTES: Routes = [
  {
    path: '',
    component: QuotePickerComponent,
    canActivate: [authGuard],        // requiere login
    title: 'Cotizador'
  },
  {
    path: ':id',
    component: QuoteDetailComponent,
    canActivate: [authGuard],
    title: 'Detalle cotización'
  }
];
