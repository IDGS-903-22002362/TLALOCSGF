import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface SalesRow { date: string; orders: number; units: number; total: number; }
export interface SalesHeader { from: string; to: string; orders: number; units: number; total: number; }
export interface SalesResponse { header: SalesHeader; rows: SalesRow[]; }

export interface RotationRow {
  materialId: number;
  name: string;
  sku?: string | null;
  stockQty: number;
  avgDailyOut: number;
  daysSupply: number | null;
}
export interface RotationResponse { total: number; page: number; pageSize: number; rows: RotationRow[]; }

export interface MarginRow {
  productId: number;
  name: string;
  basePrice: number;
  avgSalePrice: number;
  margin: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = import.meta.env.API_URL + '/reports';
  constructor(private http: HttpClient) {}

 

  // Rotación
  getRotation(opts: { days?: number; page?: number; pageSize?: number; q?: string }) {
  let params = new HttpParams()
    .set('days', String(opts.days ?? 30))
    .set('page', String(opts.page ?? 1))
    .set('pageSize', String(opts.pageSize ?? 50));
  if (opts.q) params = params.set('q', opts.q);
  return this.http.get<RotationResponse>(`${this.api}/inventory-rotation`, { params });
}
  exportRotation(format: 'csv'|'pdf', opts: { days?: number; page?: number; pageSize?: number; q?: string }) {
  let params = new HttpParams()
    .set('format', format)
    .set('days', String(opts.days ?? 30))
    .set('page', String(opts.page ?? 1))
    .set('pageSize', String(opts.pageSize ?? 50));
  if (opts.q) params = params.set('q', opts.q);
  return this.http.get(`${this.api}/inventory-rotation`, { params, responseType: 'blob', observe: 'response' });
}

  // Márgenes
  getMargins(opts: { from?: Date; to?: Date; productId?: number }): Observable<{ from: string; to: string; rows: MarginRow[] }> {
    let params = new HttpParams();
    if (opts.from) params = params.set('from', opts.from.toISOString());
    if (opts.to)   params = params.set('to',   opts.to.toISOString());
    if (opts.productId) params = params.set('productId', String(opts.productId));
    return this.http.get<{ from: string; to: string; rows: MarginRow[] }>(`${this.api}/costs-margins`, { params });
  }
  exportMargins(format: 'csv', opts: { from?: Date; to?: Date; productId?: number }) {
    let params = new HttpParams().set('format', format);
    if (opts.from) params = params.set('from', opts.from.toISOString());
    if (opts.to)   params = params.set('to',   opts.to.toISOString());
    if (opts.productId) params = params.set('productId', String(opts.productId));
    return this.http.get(`${this.api}/costs-margins`, { params, responseType: 'blob', observe: 'response' });
  }
  getSales(opts: { from?: Date; to?: Date; tzOffset?: number; customerId?: string; productId?: number }) {
  let params = new HttpParams();
  if (opts.from) params = params.set('from', opts.from.toISOString());
  if (opts.to) params = params.set('to', opts.to.toISOString());
  if (typeof opts.tzOffset === 'number') params = params.set('tzOffset', String(opts.tzOffset));
  if (opts.customerId) params = params.set('customerId', opts.customerId);
  if (opts.productId) params = params.set('productId', String(opts.productId));
  return this.http.get<SalesResponse>(`${this.api}/sales`, { params });
}
exportSales(format:'csv'|'pdf', opts: { from?: Date; to?: Date; tzOffset?: number; customerId?: string; productId?: number }) {
  let params = new HttpParams().set('format', format);
  // mismos params que arriba...
  return this.http.get(`${this.api}/sales`, { params, responseType: 'blob', observe: 'response' });
}

  
}
