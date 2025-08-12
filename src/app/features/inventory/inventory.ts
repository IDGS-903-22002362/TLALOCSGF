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
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Importación única desde el servicio
 // Asegúrate que sea .service.ts
import { InventoryService, InventoryMovement, MaterialBasic } from '../../core/services/inventory';
@Component({
  standalone: true,
  selector: 'app-inventory',
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule
  ],
})
export class Inventory implements OnInit {
  movements: InventoryMovement[] = [];
  materials: MaterialBasic[] = [];
  displayedColumns: string[] = [
    'fecha', 
    'entrada', 
    'salida', 
    'existencias',
    'costoUnitario',
    'promedio',
    'debo',
    'haber',
    'saldo'
  ];
  loading = false;
  selectedMaterial: number | null = null;

  constructor(
    private inventoryService: InventoryService,
    private snack: MatSnackBar
  ) {}
 ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.loading = true;
    this.inventoryService.getMaterialsBasic().subscribe({
      next: (res) => {
        this.materials = res;
      },
      error: () => this.snack.open('Error cargando materiales', 'Cerrar'),
      complete: () => (this.loading = false),
    });
  }

  loadInventoryData(): void {
    if (!this.selectedMaterial) return;

    this.loading = true;
    this.movements = [];

    this.inventoryService.getAverageCosting(this.selectedMaterial).subscribe({
      next: (res) => {
        this.movements = res;
      },
      error: () => this.snack.open('Error cargando datos de inventario', 'Cerrar'),
      complete: () => (this.loading = false),
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }

  formatNumber(value: number): string {
    return value.toString();
  }
}
