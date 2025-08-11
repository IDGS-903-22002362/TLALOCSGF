import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

/* DTOs según tu backend */
export interface ReviewResponseDto {
  reviewId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  customerName: string;
}

export interface ReviewDto {
  rating: number;
  comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private readonly api = import.meta.env.API_URL + '/reviews';

  constructor(private http: HttpClient, private jwt: JwtHelperService) { }

  /** Obtener reseñas aprobadas de un producto */
  getReviewsForProduct(productId: number): Observable<ReviewResponseDto[]> {
    return this.http.get<ReviewResponseDto[]>(`${this.api}/product/${productId}`);
  }

  /** Enviar reseña (solo clientes autenticados) */
  postReview(productId: number, review: ReviewDto): Observable<any> {
    return this.http.post(`${this.api}/product/${productId}`, review);
  }

  /** Aprobar o rechazar reseña (solo Admin) */
  approveReview(id: number, approve: boolean = true): Observable<any> {
    const params = new HttpParams().set('approve', approve);
    return this.http.put(`${this.api}/${id}/approve`, null, { params });
  }
}
