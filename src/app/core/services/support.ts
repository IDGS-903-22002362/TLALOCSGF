import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FaqDto { id: number; question: string; answer: string; }
export interface CreateFaqDto { question: string; answer: string; }
export interface UpdateFaqDto { question: string; answer: string; }

export interface TicketDto {
  id: number; subject: string; message: string;
  status: 'Open'|'In Progress'|'Closed';
  createdAt: string; closedAt?: string | null;
  customerId: string;
}
export interface CreateTicketDto { subject: string; message: string; }
export interface UpdateTicketStatusDto { status: TicketDto['status']; }

export interface PagedResult<T> { items: T[]; total: number; page: number; pageSize: number; }

export interface TicketMessageDto {
  id: number;
  ticketId: number;
  senderId: string;
  body: string;
  createdAt: string;
  senderName?: string | null;
}
export interface CreateMessageDto { body: string; }

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly api = import.meta.env.API_URL + '/support';
  constructor(private http: HttpClient) {}

  // FAQs
  getFaqs(): Observable<FaqDto[]> { return this.http.get<FaqDto[]>(`${this.api}/faqs`); }
  createFaq(dto: CreateFaqDto): Observable<FaqDto> { return this.http.post<FaqDto>(`${this.api}/faqs`, dto); }
  updateFaq(id: number, dto: UpdateFaqDto): Observable<void> { return this.http.put<void>(`${this.api}/faqs/${id}`, dto); }
  deleteFaq(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/faqs/${id}`); }

  // Tickets (cliente)
  createTicket(dto: CreateTicketDto): Observable<TicketDto> { return this.http.post<TicketDto>(`${this.api}/tickets`, dto); }
  getMyTickets(status?: string, q?: string): Observable<TicketDto[]> {
    let params = new HttpParams(); if (status) params = params.set('status', status); if (q) params = params.set('q', q);
    return this.http.get<TicketDto[]>(`${this.api}/tickets/my`, { params });
  }
  getTicket(id: number): Observable<TicketDto> { return this.http.get<TicketDto>(`${this.api}/tickets/${id}`); }

  // Tickets (admin)
  getTicketsAdmin(opts: { status?: string; q?: string; page?: number; pageSize?: number }): Observable<PagedResult<TicketDto>> {
    let params = new HttpParams().set('page', String(opts.page ?? 1)).set('pageSize', String(opts.pageSize ?? 10));
    if (opts.status) params = params.set('status', opts.status);
    if (opts.q) params = params.set('q', opts.q);
    return this.http.get<PagedResult<TicketDto>>(`${this.api}/tickets`, { params });
  }
  updateTicketStatus(id: number, status: UpdateTicketStatusDto['status']): Observable<void> {
    return this.http.put<void>(`${this.api}/tickets/${id}/status`, { status });
  }

  // Mensajes
  getMessages(ticketId: number): Observable<TicketMessageDto[]> {
    return this.http.get<TicketMessageDto[]>(`${this.api}/tickets/${ticketId}/messages`);
  }
  postMessage(ticketId: number, body: string): Observable<TicketMessageDto> {
    return this.http.post<TicketMessageDto>(`${this.api}/tickets/${ticketId}/messages`, { body } as CreateMessageDto);
  }
  publishTicketAsFaq(id: number, question?: string, answer?: string) {
  const body: any = {};
  if (question) body.question = question;
  if (answer) body.answer = answer;
  return this.http.post<FaqDto>(`${this.api}/tickets/${id}/to-faq`, body);
}
}
