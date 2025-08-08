// src/app/core/services/access-requests.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AccessRequest { id: number; email: string; fullName?: string; status: string; createdAt: string; }

@Injectable({ providedIn: 'root' })
export class AccessRequestsService {
  private readonly api = import.meta.env.API_URL;
  constructor(private http: HttpClient) {}
  request(email: string, fullName?: string) {
    return this.http.post(`${this.api}/accessrequests`, { email, fullName });
  }
  list(status = 'Pending'): Observable<AccessRequest[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<AccessRequest[]>(`${this.api}/accessrequests`, { params });
  }
  approve(id: number) {
  return this.http.post<void>(`${this.api}/accessrequests/${id}/approve`, {});
}
  reject(id: number, reason: string, notify = false) { return this.http.post<void>(`${this.api}/accessrequests/${id}/reject`, { reason, notify }); }
}
