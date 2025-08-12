import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReviewsService, ReviewResponseDto } from '../../core/services/reviews';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: '../products/product-reviews.html'
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: number;

  reviews: ReviewResponseDto[] = [];
  approvedReviews: ReviewResponseDto[] = [];
  loadingReviews = true;

  canReview = false;       // viene de /canReview
  orderId?: string;        // opcional, pero no se envía en el POST
  isAdmin = false;

  reviewForm!: FormGroup;
  submitting = false;
  message: string | null = null;

  private reviewsService = inject(ReviewsService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.checkUserRole();

    this.reviewForm = this.fb.group({
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(1000)]]
    });

    this.loadReviews();
    this.checkPurchaseStatus();
  }

  private checkUserRole() {
    this.isAdmin = this.authService.hasRole('Admin') || this.authService.hasRole('Administrator');
  }

  loadReviews() {
    this.loadingReviews = true;
    this.reviewsService.getReviewsForProduct(this.productId).subscribe({
      next: (data) => {
        this.reviews = data;
        this.approvedReviews = data; // el backend ya regresa solo aprobadas
        this.loadingReviews = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingReviews = false;
      }
    });
  }

  checkPurchaseStatus() {
    this.reviewsService.canReview(this.productId).subscribe({
      next: (response) => {
        this.canReview = response.canReview;
        this.orderId = response.orderId; // por si lo quieres mostrar, no se envía al POST
      },
      error: (err) => {
        console.error('Error verificando compra:', err);
        this.canReview = false;
      }
    });
  }

  submitReview() {
    if (this.reviewForm.invalid) return;

    const payload = {
      rating: this.reviewForm.value.rating as number,
      comment: this.reviewForm.value.comment as string | undefined
      // NO enviamos orderId porque el backend no lo espera
    };

    this.submitting = true;
    this.reviewsService.postReview(this.productId, payload).subscribe({
      next: () => {
        this.message = '¡Reseña enviada para aprobación!';
        this.submitting = false;
        this.reviewForm.reset();
        this.checkPurchaseStatus(); // opcional: revalidar
        this.loadReviews();         // refrescar lista
      },
      error: (err) => {
        this.message = 'Error al enviar la reseña';
        console.error(err);
        this.submitting = false;
      }
    });
  }

  // Mantener para que el template no falle si lo usa (no tenemos endpoint de pendientes aún)
  get pendingReviews(): ReviewResponseDto[] {
    return [];
  }

  approveReview(reviewId: number, approve: boolean) {
    if (!this.isAdmin) return;

    this.reviewsService.approveReview(reviewId, approve).subscribe({
      next: () => {
        this.message = approve ? 'Reseña aprobada.' : 'Reseña rechazada.';
        this.loadReviews();
      },
      error: (err) => {
        this.message = err.error?.message || 'Error al procesar la reseña.';
      }
    });
  }
}
