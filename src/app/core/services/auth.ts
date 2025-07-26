import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map, tap, Observable, switchMap, throwError, of } from 'rxjs';

export interface LoginDto      { email: string;  password: string; }
export interface RegisterDto   { email: string;  password: string; fullName: string; role?: string; }
export interface AuthResponse  { accessToken: string; refreshToken: string; expiresIn: number; roles: string[]; }
export interface RefreshDto    { accessToken: string; refreshToken: string; }
export interface UserProfile   { id: string; fullName: string; email: string; roles: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = import.meta.env.API_URL;

  constructor(private http: HttpClient, private jwt: JwtHelperService) {}

  /*──────────── Registro ────────────*/
  register(dto: RegisterDto): Observable<void> {
    return this.http.post(`${this.api}/auth/register`, dto).pipe(map(() => void 0));
  }

  /*──────────── Login ────────────*/
  login(dto: LoginDto): Observable<void> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, dto)
      .pipe(tap(res => this.storeTokens(res)), map(() => void 0));
  }

  /*──────────── Refresh token ────────────*/
  refresh(): Observable<void> {
    const refreshDto: RefreshDto = {
      accessToken: localStorage.getItem('token')!,
      refreshToken: localStorage.getItem('refresh')!
    };
    return this.http.post<AuthResponse>(`${this.api}/auth/refresh`, refreshDto)
      .pipe(tap(r => this.storeTokens(r)), map(() => void 0));
  }

  /*──────────── Perfil ────────────*/
  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/auth/me`);
  }

  /*──────────── Logout ────────────*/
  logout(): Observable<void> {
    return this.http.post(`${this.api}/auth/logout`, {}).pipe(
      tap(() => { localStorage.clear(); }),
      map(() => void 0)
    );
  }

  /*──────────── Helpers ────────────*/
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.jwt.isTokenExpired(token);
  }
  get roles(): string[] {
    const token = localStorage.getItem('token');
    return token ? this.jwt.decodeToken(token).role?.split(',') ?? [] : [];
  }

  private storeTokens(r: AuthResponse) {
    localStorage.setItem('token',   r.accessToken);
    localStorage.setItem('refresh', r.refreshToken);
    localStorage.setItem('exp',     (Date.now() + r.expiresIn * 1000).toString());
  }
}
