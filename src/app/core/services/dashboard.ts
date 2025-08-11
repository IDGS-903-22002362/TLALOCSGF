import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SeriesPointDto { date: string; value: number; }
export interface TopProductDto { productId: number; name: string; units: number; total: number; }
export interface LowStockDto { materialId: number; name: string; onHand: number; }

export interface KpiDto {
  sales: number;
  orders: number;
  pendingQuotes: number;
  openTickets: number;
  lowStock: number;
}

export interface AdminDashboardDto {
  kpis: KpiDto;
  salesByDay: SeriesPointDto[];
  topProducts: TopProductDto[];
  lowStock: LowStockDto[];
}

export interface ClientKpis {
  myDraftQuotes: number;
  myApprovedQuotes: number;
  myOpenTickets: number;
  myOrdersTotalLast30d: number;
}

export interface ClientDashboardDto {
  kpis: ClientKpis;
  myOrdersByDay: SeriesPointDto[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = import.meta.env.API_URL;
  private http = inject(HttpClient);

  getAdmin(from?: string, to?: string, top = 5, lowStockThreshold = 5): Observable<AdminDashboardDto> {
    let params = new HttpParams().set('top', top).set('lowStockThreshold', lowStockThreshold);
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<AdminDashboardDto>(`${this.api}/dashboard/admin`, { params });
  }

  getMe(from?: string, to?: string): Observable<ClientDashboardDto> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<ClientDashboardDto>(`${this.api}/dashboard/me`, { params });
  }
}
