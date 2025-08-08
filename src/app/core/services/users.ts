import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
}

export interface UserQuery {
  page?: number;
  pageSize?: number;
  active?: boolean;
  role?: string;
  search?: string;
}

export interface UserCreateDto {
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string;
  password?: string;
}

export interface UserUpdateDto {
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = import.meta.env.API_URL;

  constructor(private http: HttpClient) {}

  list(q: UserQuery): Observable<PagedResult<UserSummary>> {
    let params = new HttpParams()
      .set('Page',     String(q.page ?? 1))
      .set('PageSize', String(q.pageSize ?? 10));
    if (q.role)   params = params.set('Role', q.role);
    if (q.search) params = params.set('Search', q.search);
    if (typeof q.active === 'boolean') params = params.set('Active', String(q.active));
    return this.http.get<PagedResult<UserSummary>>(`${this.api}/users`, { params });
  }

  get(id: string): Observable<UserSummary> {
    return this.http.get<UserSummary>(`${this.api}/users/${id}`);
  }

  create(dto: UserCreateDto): Observable<UserSummary> {
    return this.http.post<UserSummary>(`${this.api}/users`, dto);
  }

  update(id: string, dto: UserUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.api}/users/${id}`, dto);
  }

  changeRole(id: string, role: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/users/${id}/role`, JSON.stringify(role), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/users/${id}`);
  }

  activate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/users/${id}/activate`, {});
  }

  resetPassword(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/users/${id}/reset-password`, {});
  }

  roles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/users/roles`);
  }
}
