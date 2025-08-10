import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product }           from '../../models/product';
import {
  CreateQuoteDto,
  QuoteDetailDto,
} from '../../models/quote';
export type Fulfillment = 'DevicesOnly' | 'Shipping' | 'Installation';

export interface QuoteOptionsDto {
  fulfillment: Fulfillment;
  stateCode?: string;
  manualDistanceKm?: number | null;
}

export interface QuotePricePreviewDto {
  products: number;
  installBase: number;
  transport: number;
  shipping: number;
  grandTotal: number;
}

export interface StateOption { stateCode: string; stateName: string; }

@Injectable({ providedIn: 'root' })
export class QuoteService {

  private readonly api = import.meta.env.API_URL;

  constructor(private http: HttpClient) {}

  /*── Productos ──*/
  getProducts(name?: string): Observable<Product[]> {
    const params = name ? new HttpParams().set('name', name) : undefined;
    return this.http.get<Product[]>(`${this.api}/products`, { params });
  }

  /*── Cotización ──*/
  createQuote(dto: CreateQuoteDto): Observable<QuoteDetailDto> {
    return this.http.post<QuoteDetailDto>(`${this.api}/quotes`, dto);
  }

  getQuote(id: number): Observable<QuoteDetailDto> {
    return this.http.get<QuoteDetailDto>(`${this.api}/quotes/${id}`);
  }
  emailQuote(id: number) {
  return this.http.post<void>(`${this.api}/quotes/${id}/email`, {});
}
previewPrice(id: number, dto: QuoteOptionsDto) {
  return this.http.post<QuotePricePreviewDto>(`${this.api}/quotes/${id}/price`, dto);
}

setOptions(id: number, dto: QuoteOptionsDto) {
  return this.http.put<QuotePricePreviewDto>(`${this.api}/quotes/${id}/options`, dto);
}

getStates() {
  // usa la ruta donde dejaste el endpoint (SupportController recomendado)
  return this.http.get<StateOption[]>(`${this.api}/support/states`);
}
}

