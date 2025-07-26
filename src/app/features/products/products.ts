import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';


import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { Product, ProductService } from '../../core/services/products';
import { ProductFormComponent } from './product-form';
import { ProductBOMDialogComponent } from './product-bom-dialog';

@Component({
  standalone: true,
  selector: 'app-products',
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
})
export class Products implements OnInit {
  products: Product[] = [];
  displayedColumns = ['sku', 'name', 'price', 'actions'];
  loading = false;
  search: string = '';

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll(this.search).subscribe({
      next: (res) => (this.products = res),
      error: () => this.snack.open('Error cargando productos', 'Cerrar'),
      complete: () => (this.loading = false),
    });
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este producto?')) return;

    this.productService.delete(id).subscribe({
      next: () => {
        this.snack.open('Producto eliminado', 'Cerrar', { duration: 2000 });
        this.loadProducts();
      },
      error: () => this.snack.open('Error al eliminar', 'Cerrar')
    });
  }

  newProduct(): void {
    const ref = this.dialog.open(ProductFormComponent);

    ref.afterClosed().subscribe((refresh) => {
      if (refresh) this.loadProducts();
    });
  }

  editProduct(product: Product): void {
    const ref = this.dialog.open(ProductFormComponent, {
      data: {
        editMode: true,
        product: product
      }
    });

    ref.afterClosed().subscribe((refresh) => {
      if (refresh) this.loadProducts();
    });
  }

  viewBOM(productId: number): void {
    this.dialog.open(ProductBOMDialogComponent, {
      data: { productId }
    });
  }
}
