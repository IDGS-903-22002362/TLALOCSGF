import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactInfo {
  company: string; email: string; phone: string; address: string; hours: string;
  facebook?: string; instagram?: string; x?: string; mapsUrl?: string;
}
export interface CreateContactDto {
  fullName: string; email: string; phone?: string | null;
  topic: string; message: string; asTicket?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private api = import.meta.env.API_URL;
  constructor(private http: HttpClient) {}
  info(): Observable<ContactInfo> { return this.http.get<ContactInfo>(`${this.api}/contact/info`); }
  send(dto: CreateContactDto): Observable<{ id: number }> { return this.http.post<{id:number}>(`${this.api}/contact`, dto); }
}
