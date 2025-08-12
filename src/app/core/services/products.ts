import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map, tap, Observable, switchMap, throwError, of } from 'rxjs';

export interface Product { productId: number; sku: string; name: string; description?: string; basePrice: number; createdAt: string; updatedAt: string; }
export interface ProductCreateDto { sku: string; name: string; description?: string; basePrice: number; }
export interface ProductUpdateDto extends ProductCreateDto { productId: number; }
export interface MaterialBOM { materialId: number; name: string; quantity: number; unitOfMeasure: string; }

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = import.meta.env.API_URL + '/products';

  constructor(private http: HttpClient, private jwt: JwtHelperService) { }

  /*──────────── Obtener todos (catálogo con filtros opcionales) ────────────*/
  getAll(name?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (name && name.trim().length > 0) {
      params = params.set('name', name.trim());
    }
    return this.http.get<Product[]>(`${this.api}`, { params });
  }

  /*──────────── Obtener lista de materiales (BOM) ────────────*/
  getBOM(productId: number): Observable<MaterialBOM[]> {
    return this.http.get<MaterialBOM[]>(`${this.api}/${productId}/bom`);
  }

  /*──────────── Crear producto ────────────*/
  create(dto: ProductCreateDto): Observable<Product> {
    return this.http.post<Product>(`${this.api}`, dto);
  }

  /*──────────── Editar producto ────────────*/
  update(dto: ProductUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.api}/${dto.productId}`, dto);
  }

  /*──────────── Eliminar producto ────────────*/
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
  createWithBOM(dto: any): Observable<any> {
  return this.http.post(`${this.api}/with-bom`, dto);
}

}
