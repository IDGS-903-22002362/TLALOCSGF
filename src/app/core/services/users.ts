// src/app/core/services/users.ts
import { inject, Injectable }           from '@angular/core';
import { HttpClient, HttpParams }       from '@angular/common/http';
import { Observable }                   from 'rxjs';
import {
  UserQuery,
  UserUpdate,
  UserWithRoles
}                                       from '../../models/users';

@Injectable({ providedIn: 'root' })
export class UsersService {

  private readonly http = inject(HttpClient);

  /** URL base definida en angular.json → "define": { "API_URL":"https://localhost:7149/api" } */
  private readonly api: string = (import.meta.env['API_URL'] as string) + '/users';

  /* ───────────────────────────── GET  /api/users  ───────────────────────────── */
  list(q: UserQuery): Observable<UserWithRoles[]> {
    const params = new HttpParams({
      fromObject: {
        page     : q.page     .toString(),
        pageSize : q.pageSize .toString(),
        role     : q.role   ?? '',
        active   : q.active ?? ''
      }
    });

    return this.http.get<UserWithRoles[]>(this.api, { params });
  }

  /* ───────────────────────────── GET  /api/users/{id}  ──────────────────────── */
  detail(id: string): Observable<UserWithRoles> {     // ← alias “get” si lo prefieres
    return this.http.get<UserWithRoles>(`${this.api}/${id}`);
  }

  /* ───────────────────────────── PUT  /api/users/{id}  ──────────────────────── */
  update(id: string, dto: UserUpdate): Observable<void> {
    return this.http.put<void>(`${this.api}/${id}`, dto);
  }

  /* ───────────────────────────── PATCH /api/users/{id}/role  ────────────────── */
  changeRole(id: string, role: string): Observable<string> {
    // backend espera un string plano → se envuelve entre comillas JSON
    return this.http.patch(`${this.api}/${id}/role`, `"${role}"`, {
      responseType: 'text'
    });
  }

  /* ───────────────────────────── DELETE /api/users/{id}  ────────────────────── */
  disable(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
