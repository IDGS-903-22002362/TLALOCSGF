import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, map, tap, throwError } from 'rxjs';

export interface LoginDto     { email: string; password: string; }
export interface RegisterDto  { email: string; password: string; fullName: string; role?: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; expiresIn: number; roles: string[]; }
export interface RefreshDto   { accessToken: string; refreshToken: string; }
export interface UserProfile  { id: string; fullName: string; email: string; roles: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = import.meta.env.API_URL;      // 👈  usa tu variable de entorno

  constructor(private http: HttpClient, private jwt: JwtHelperService) {}

  /*──────── Registro ────────*/
  register(dto: RegisterDto): Observable<void> {
    return this.http.post(`${this.api}/auth/register`, dto).pipe(map(() => void 0));
  }

  /*──────── Login ────────*/
  login(dto: LoginDto): Observable<void> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, dto).pipe(
      tap(r => this.storeTokens(r)),
      map(() => void 0)
    );
  }

  /*──────── Refresh ────────*/
  refresh(): Observable<void> {
    const refreshDto: RefreshDto = {
      accessToken: localStorage.getItem('token') ?? '',
      refreshToken: localStorage.getItem('refresh') ?? ''
    };

    // Si falta el refresh-token evitamos llamada infinita
    if (!refreshDto.accessToken || !refreshDto.refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<AuthResponse>(`${this.api}/auth/refresh`, refreshDto).pipe(
      tap(r => this.storeTokens(r)),
      map(() => void 0)
    );
  }

  /*──────── Perfil ────────*/
  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/auth/me`);
  }

  /*──────── Logout ────────*/
  logout(): Observable<void> {
    return this.http.post(`${this.api}/auth/logout`, {}).pipe(
      tap(() => localStorage.clear()),
      map(() => void 0)
    );
  }

  /*──────── Helpers ────────*/
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.jwt.isTokenExpired(token);
  }

  /** Devuelve siempre un array, venga el claim `role` como string o como array  */
  get roles(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const claim = this.jwt.decodeToken(token).role;
    return Array.isArray(claim)
      ? claim
      : typeof claim === 'string'
        ? claim.split(',').map(r => r.trim())
        : [];
  }

  /*──────── Interno ────────*/
  private storeTokens(r: AuthResponse): void {
    localStorage.setItem('token',   r.accessToken);
    localStorage.setItem('refresh', r.refreshToken);
    localStorage.setItem('exp',     (Date.now() + r.expiresIn * 1000).toString());
  }
}
