import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PurchasesService, Purchase, SupplierBasic, MaterialBasic, CompraRequest, PurchaseDetail } from '../../core/services/purchases';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-purchases',
  templateUrl: './purchases.html',
  styleUrls: ['./purchases.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule,
    MatToolbarModule
  ],
})
export class PurchasesComponent implements OnInit {
  purchases: Purchase[] = [];
  suppliers: SupplierBasic[] = [];
  materials: MaterialBasic[] = [];

  displayedColumns: string[] = ['supplier', 'date', 'total', 'status', 'actions'];

  // Formulario surtir/editar
  formData: CompraRequest = {
    supplierId: 0,
    materialId: 0,
    quantity: 0,
    unitCost: 0,
    movementType: 'E'
  };
  modalOpen = false;
  loading = false;
  editingId: number | null = null;

  constructor(
    private purchasesService: PurchasesService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPurchases();
    this.loadSuppliers();
    this.loadMaterials();
  }

  loadPurchases(): void {
    this.loading = true;
    this.purchasesService.getPurchases().subscribe({
      next: (res) => this.purchases = res,
      error: () => this.snack.open('Error cargando compras', 'Cerrar', { duration: 3000 }),
      complete: () => this.loading = false
    });
  }

  loadSuppliers(): void {
    this.purchasesService.getSuppliers().subscribe({
      next: (res) => this.suppliers = res,
      error: () => this.snack.open('Error cargando proveedores', 'Cerrar', { duration: 3000 })
    });
  }

  loadMaterials(): void {
    this.purchasesService.getMaterials().subscribe({
      next: (res) => this.materials = res,
      error: () => this.snack.open('Error cargando materiales', 'Cerrar', { duration: 3000 })
    });
  }

  openModal(): void {
    this.formData = { supplierId: 0, materialId: 0, quantity: 0, unitCost: 0, movementType: 'E' };
    this.editingId = null;
    this.modalOpen = true;
  }

  openEditModal(purchase: Purchase): void {
    this.loading = true;
    this.purchasesService.getPurchaseById(purchase.purchaseId).subscribe({
      next: (detalle: PurchaseDetail) => {
        this.formData = {
          supplierId: detalle.supplierId,
          materialId: detalle.materialId,
          quantity: detalle.quantity,
          unitCost: detalle.unitCost,
          movementType: 'E'
        };
        this.editingId = detalle.purchaseId;
        this.modalOpen = true;
      },
      error: () => this.snack.open('Error cargando datos de la compra', 'Cerrar', { duration: 3000 }),
      complete: () => this.loading = false
    });
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  submitForm(): void {
    if (!this.formData.supplierId || !this.formData.materialId || this.formData.quantity <= 0 || this.formData.unitCost <= 0) {
      this.snack.open('Por favor llena todos los campos', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.editingId) {
      this.purchasesService.editarCompra(this.editingId, this.formData).subscribe({
        next: () => {
          this.snack.open('Compra actualizada con éxito', 'Cerrar', { duration: 3000 });
          this.closeModal();
          this.loadPurchases();
          this.editingId = null;
        },
        error: () => this.snack.open('Error al actualizar compra', 'Cerrar', { duration: 3000 })
      });
    } else {
      this.purchasesService.surtirMaterial(this.formData).subscribe({
        next: () => {
          this.snack.open('Material surtido con éxito', 'Cerrar', { duration: 3000 });
          this.closeModal();
          this.loadPurchases();
        },
        error: () => this.snack.open('Error al surtir material', 'Cerrar', { duration: 3000 })
      });
    }
  }

  cancelarCompra(id: number): void {
    if (confirm('¿Seguro que deseas cancelar esta compra?')) {
      this.purchasesService.cancelarCompra(id).subscribe({
        next: () => {
          this.snack.open('Compra cancelada con éxito', 'Cerrar', { duration: 3000 });
          this.loadPurchases();
        },
        error: () => this.snack.open('Error al cancelar compra', 'Cerrar', { duration: 3000 })
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }
}
