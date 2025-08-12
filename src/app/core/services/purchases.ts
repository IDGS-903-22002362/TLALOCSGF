import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PurchasesService {
  private readonly api = import.meta.env.API_URL + '/purchases';

  constructor(private http: HttpClient) {}

  getPurchases(): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.api}`);
  }

  surtirMaterial(req: CompraRequest): Observable<any> {
    return this.http.post(`${this.api}/surtir`, req);
  }

  getSuppliers(): Observable<SupplierBasic[]> {
    return this.http.get<SupplierBasic[]>(`${this.api}/suppliers/basic`);
  }

  getMaterials(): Observable<MaterialBasic[]> {
    return this.http.get<MaterialBasic[]>(`${this.api}/materials/basic`);
  }
  editarCompra(id: number, req: CompraRequest): Observable<any> {
  return this.http.put(`${this.api}/editar/${id}`, req);
}

cancelarCompra(id: number): Observable<any> {
  return this.http.put(`${this.api}/cancelar/${id}`, {});
}
 getPurchaseById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }



}

export interface Purchase {
  purchaseId: number;
  supplierName: string;
  purchaseDate: string;
  totalAmount: number;
  status: string;
}

export interface SupplierBasic {
  supplierId: number;
  name: string;
}

export interface MaterialBasic {
  materialId: number;
  name: string;
}

export interface CompraRequest {
  supplierId: number;
  materialId: number;
  quantity: number;
  unitCost: number;
  movementType?: string; // se manda como 'E'
}
export interface PurchaseDetail {
  purchaseId: number;
  supplierId: number;
  materialId: number;
  quantity: number;
  unitCost: number;
}
