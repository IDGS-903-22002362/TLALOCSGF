// src/app/features/quotes/quotes.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';
import { QuotePickerComponent } from './quote-picker';
import { QuoteDetailComponent } from './quote-detail';
import { QuotesShellComponent } from './quotes-shell';

export const QUOTE_ROUTES: Routes = [
  {
    path: '',
    component: QuotesShellComponent,   
    canActivateChild: [authGuard],     
    children: [
      { path: '',    component: QuotePickerComponent,  title: 'Cotizador' },
      { path: ':id', component: QuoteDetailComponent,  title: 'Detalle cotización' }
    ]
  }
];
