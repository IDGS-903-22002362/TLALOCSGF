import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = import.meta.env.API_URL + '/cost';

  constructor(private http: HttpClient) {}

  getAverageCosting(materialId: number): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(`${this.api}/promedio/${materialId}`);
  }

  getMaterialsBasic(): Observable<MaterialBasic[]> {
    return this.http.get<MaterialBasic[]>(`${this.api}/basic`);
  }
}

export interface InventoryMovement {
  fecha: string;
  entrada: number;
  salida: number;
  existencias: number;
  costoUnitario: number;
  promedio: number | null;
  debo: number;
  haber: number;
  saldo: number;
}

export interface MaterialBasic {
  materialId: number;
  name: string;
}

