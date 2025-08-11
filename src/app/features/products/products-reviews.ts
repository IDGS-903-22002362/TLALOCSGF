import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReviewsService, ReviewResponseDto, ReviewDto } from '../../core/services/reviews';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: '../products/product-reviews.html'
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: number;
  reviews: ReviewResponseDto[] = [];
  loadingReviews = true;

  reviewForm!: FormGroup;
  submitting = false;
  message: string | null = null;

  private reviewsService = inject(ReviewsService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.loadReviews();

    this.reviewForm = this.fb.group({
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(1000)]]
    });
  }

  loadReviews() {
    this.loadingReviews = true;
    this.reviewsService.getReviewsForProduct(this.productId).subscribe({
      next: (data) => {
        this.reviews = data;
        this.loadingReviews = false;
      },
      error: (error) => {
        console.error(error);
        this.loadingReviews = false;
      }
    });
  }

  submitReview() {
    if (this.reviewForm.invalid) {
      this.message = 'Por favor, complete el formulario correctamente.';
      return;
    }

    this.submitting = true;
    this.message = null;

    const review: ReviewDto = {
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment
    };

    this.reviewsService.postReview(this.productId, review).subscribe({
      next: (res) => {
        this.message = 'Gracias por tu reseña. Está pendiente de aprobación.';
        this.reviewForm.reset();
        this.loadReviews();
        this.submitting = false;
      },
      error: (err) => {
        this.message = err.error || 'Error al enviar la reseña.';
        this.submitting = false;
      }
    });
  }
}
