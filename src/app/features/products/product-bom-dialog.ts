import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MaterialBOM, ProductService } from '../../core/services/products';

@Component({
  standalone: true,
  selector: 'app-product-bom-dialog',
  templateUrl: './product-bom-dialog.html',
  styleUrls: ['./product-bom-dialog.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
  ]
})
export class ProductBOMDialogComponent {
  bom: MaterialBOM[] = [];
  displayedColumns = ['materialId', 'name', 'quantity', 'unitOfMeasure'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { productId: number },
    private productService: ProductService
  ) {
    this.loadBOM();
  }

  loadBOM(): void {
    this.productService.getBOM(this.data.productId).subscribe({
      next: (res) => this.bom = res,
      error: () => console.error('Error al cargar BOM')
    });
  }
}
