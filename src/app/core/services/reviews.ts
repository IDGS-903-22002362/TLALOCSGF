import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReviewResponseDto {
  reviewId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  customerName: string;
}

export interface CanReviewResponse {
  canReview: boolean;
  orderId?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  // IMPORTANTE: backticks
  private readonly api = `${import.meta.env.API_URL}/reviews`;

  constructor(private http: HttpClient) {}

  /** Obtener reseñas aprobadas de un producto */
  getReviewsForProduct(productId: number): Observable<ReviewResponseDto[]> {
    return this.http.get<ReviewResponseDto[]>(
      `${this.api}/product/${productId}`
    );
  }

  /** Enviar reseña (solo clientes autenticados) */
  postReview(
    productId: number,
    review: { rating: number; comment?: string }
  ): Observable<any> {
    return this.http.post(
      `${this.api}/product/${productId}`,
      review
    );
  }

  /** Aprobar o rechazar reseña (solo Admin) */
  approveReview(id: number, approve: boolean = true): Observable<any> {
    const params = new HttpParams().set('approve', String(approve));
    return this.http.put(
      `${this.api}/${id}/approve`,
      null,
      { params }
    );
    // Si tu backend acepta body vacío, perfecto; si no, envía {} en lugar de null.
  }

  /** Verificar si el cliente puede dejar reseña para un producto */
  canReview(productId: number): Observable<CanReviewResponse> {
    const params = new HttpParams().set('productId', productId.toString());
    return this.http.get<CanReviewResponse>(
      `${this.api}/canReview`,
      { params }
    );
  }
}
