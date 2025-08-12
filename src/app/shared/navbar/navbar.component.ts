import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { RouterLink, RouterLinkActive } from '@angular/router';


type NavItem = { label: string; path: string; external?: boolean };

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule,RouterLink,
    RouterLinkActive,],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  /** Cliente y Admin ven estos links principales */
  readonly baseNav: NavItem[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Producto', path: '/products' },
    { label: 'FAQ', path: '/support/faqs' },
  ];

  /** Acciones que dependen de login */
  get cotizaPath(): string {
    return this.auth.isLoggedIn() ? '/quotes' : '/auth';
  }

  get contactoPath(): string {
    return this.auth.isLoggedIn() ? '/contact' : '/auth';
  }

  /** ¿Es admin? */
  get isAdmin(): boolean {
    return this.auth.roles?.some(r => r.toLowerCase() === 'admin') ?? false;
  }

  /** Menú Admin (solo si isAdmin) */
  readonly adminMenu: NavItem[] = [
    { label: 'Dashboard',        path: '/dashboard' },
    { label: 'Usuarios',         path: '/users' },
    { label: 'Solicitudes',      path: '/requests' },                // ./features/requests/requests
    { label: 'Tickets (Admin)',  path: '/support/admin/tickets' },   // admin tickets
    { label: 'Reportes',         path: '/reports' },                 // ./features/reports/routes
    { label: 'Proveedores',      path: '/suppliers' },               // ./features/suppliers/suppliers
    { label: 'Inventario',       path: '/inventory' },   
     { label: 'Compras',       path: '/purchases' }           // ./features/inventory/inventory
  ];

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
