import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map, tap, Observable, switchMap, throwError, of } from 'rxjs';


export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Cancelled'| 'Delivered';

export interface OrderLine {
  productId: number;
  
  quantity: number;
  unitPrice: number;
}

export interface OrderCreateDto {
  quoteId?: number | null;
  lines: OrderLine[];
}

export interface OrderResponseDto {
  orderId: number;
  status: OrderStatus;
  totalAmount: number;
  orderDate: string;
  lines: OrderLine[];
}

export interface PaymentDto {
  amount: number;
  method: string;
  reference?: string;
}



@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private readonly api = import.meta.env.API_URL + '/orders';
  
    constructor(private http: HttpClient, private jwt: JwtHelperService) { }

  /** 1. Crear orden (cliente) */
  createOrder(order: OrderCreateDto): Observable<any> {
    return this.http.post<any>(`${this.api}`, order, {
      headers: this.getAuthHeaders()
    });
  }

  /** 2. Obtener mis órdenes (cliente) */
  getMyOrders(): Observable<OrderResponseDto[]> {
    return this.http.get<OrderResponseDto[]>(`${this.api}/mine`, {
      headers: this.getAuthHeaders()
    });
  }

  /** 3. Obtener todas las órdenes (admin) con filtros opcionales */
  getAllOrders(from?: string, to?: string, status?: string): Observable<OrderResponseDto[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (status) params = params.set('status', status);

    return this.http.get<OrderResponseDto[]>(`${this.api}`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  /** 4. Registrar pago */
  registerPayment(orderId: number, payment: PaymentDto): Observable<any> {
    return this.http.post<any>(`${this.api}/${orderId}/payments`, payment, {
      headers: this.getAuthHeaders()
    });
  }

  /** 5. Actualizar estado de orden (admin) */
  updateOrderStatus(orderId: number, newStatus: OrderStatus): Observable<any> {
  return this.http.put<any>(`${this.api}/${orderId}/status`, `"${newStatus}"`, {
    headers: this.getAuthHeaders({ contentType: 'application/json' })
  });
}


  /** Método para obtener encabezados con token */
  private getAuthHeaders(options?: { contentType?: string }): HttpHeaders {
    const token = localStorage.getItem('token'); // o el nombre donde guardes el JWT
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`
    });

    if (options?.contentType) {
      headers = headers.set('Content-Type', options.contentType);
    }

    return headers;
  }
}