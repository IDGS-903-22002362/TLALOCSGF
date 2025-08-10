import { Routes } from '@angular/router';
import { SalesReportComponent } from './sales-report';
import { RotationReportComponent } from './rotation-report';
import { MarginsReportComponent } from './margins-report';

export const REPORTS_ROUTES: Routes = [
  { path: 'sales', component: SalesReportComponent, title: 'Reporte de ventas' },
  { path: 'rotation', component: RotationReportComponent, title: 'Rotación de inventario' },
  { path: 'margins', component: MarginsReportComponent, title: 'Márgenes' },
  { path: '', pathMatch: 'full', redirectTo: 'sales' }
];
