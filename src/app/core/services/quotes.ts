import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product }           from '../../models/product';
import {
  CreateQuoteDto,
  QuoteDetailDto,
} from '../../models/quote';

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
}
