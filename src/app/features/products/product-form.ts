import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductService, ProductCreateDto, ProductUpdateDto } from '../../core/services/products';

@Component({
  standalone: true,
  selector: 'app-product-form',
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class ProductFormComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { editMode: boolean; product: ProductUpdateDto }
  ) {
    this.form = this.fb.group({
      sku:        [data?.product?.sku || '', [Validators.required]],
      name:       [data?.product?.name || '', [Validators.required]],
      description:[data?.product?.description || ''],
      basePrice:  [data?.product?.basePrice || 0, [Validators.required, Validators.min(1)]]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const dto = this.form.getRawValue() as ProductCreateDto;

    if (this.data?.editMode) {
      const updateDto: ProductUpdateDto = {
        ...dto,
        productId: this.data.product.productId
      };
      this.productService.update(updateDto).subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          this.snack.open('Error al actualizar el producto', 'Cerrar');
          this.loading = false;
        }
      });
    } else {
      this.productService.create(dto).subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          this.snack.open('Error al crear el producto', 'Cerrar');
          this.loading = false;
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
