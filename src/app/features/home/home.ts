import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth';

// 👇 importar el componente de reseñas
import { ProductReviewsComponent } from '../products/products-reviews';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    ProductReviewsComponent // 👈 agregado aquí
  ]
})
export class HomeComponent {
  public auth = inject(AuthService);
  logout() { this.auth.logout().subscribe(); }
}
