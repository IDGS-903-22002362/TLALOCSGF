import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Supplier {
  supplierId: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCreateDto {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface SupplierUpdateDto extends SupplierCreateDto {
  supplierId: number;
}

export interface SupplierFilter {
  name?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly api = import.meta.env.API_URL + '/suppliers';

  constructor(private http: HttpClient) {}

  /* ────────── Obtener todos los proveedores con filtros ────────── */
  getAll(filters?: SupplierFilter): Observable<Supplier[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'string') {
            value = value.trim(); // Limpiar espacios en strings
            if (value) params = params.set(key, value);
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }
    
    return this.http.get<Supplier[]>(this.api, { params });
  }

  /* ────────── Obtener proveedores activos ────────── */
  getActive(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.api}/active`);
  }

  /* ────────── Obtener proveedor por ID ────────── */
  getById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.api}/${id}`);
  }

  /* ────────── Crear proveedor ────────── */
  create(dto: SupplierCreateDto): Observable<Supplier> {
    return this.http.post<Supplier>(this.api, dto);
  }

  /* ────────── Actualizar proveedor ────────── */
  update(dto: SupplierUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.api}/${dto.supplierId}`, dto);
  }

  /* ────────── Eliminar proveedor ────────── */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
  toggleStatus(id: number): Observable<{ supplierId: number, isActive: boolean }> {
    return this.http.patch<{ supplierId: number, isActive: boolean }>(
      `${this.api}/${id}/toggle-status`, 
      {}
    );
  }
}
