
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { Supplier, SupplierService } from '../../core/services/suppliers';
import { SupplierFormComponent } from './supplier-form';

@Component({
  standalone: true,
  selector: 'app-suppliers',
  templateUrl: './suppliers.html',
  styleUrls: ['./suppliers.css'],
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
    MatSlideToggleModule,
    MatCheckboxModule // Añadir este import
  ],
})
export class Suppliers implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  displayedColumns = ['name', 'contactName', 'email', 'phone', 'address', 'isActive', 'actions'];
  loading = false;
  search: string = '';
  
  // Filtros por estado
  showActive: boolean = true;
  showInactive: boolean = true;
  
  private searchSubject = new Subject<string>();

  constructor(
    private supplierService: SupplierService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getAll().subscribe({
      next: (res) => {
        this.suppliers = res;
        this.applyFilters();
      },
      error: () => this.snack.open('Error cargando proveedores', 'Cerrar'),
      complete: () => (this.loading = false),
    });
  }

  applyFilters(): void {
    let filtered = this.suppliers;
    
    // Filtro por texto
    if (this.search.trim()) {
      const searchTerm = this.search.toLowerCase().trim();
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm) ||
        (supplier.contactName?.toLowerCase().includes(searchTerm)) ||
        (supplier.email?.toLowerCase().includes(searchTerm)) ||
        (supplier.phone?.toLowerCase().includes(searchTerm)) ||
        (supplier.address?.toLowerCase().includes(searchTerm))
      );
    }

    // Filtro por estado
    if (this.showActive !== this.showInactive) {
      filtered = filtered.filter(s => 
        this.showActive ? s.isActive : !s.isActive
      );
    }

    this.filteredSuppliers = filtered;
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  toggleSupplierStatus(supplier: Supplier): void {
    const newStatus = !supplier.isActive;
    supplier.isActive = newStatus; // Cambio optimista
    
    this.supplierService.toggleStatus(supplier.supplierId).subscribe({
      error: () => {
        supplier.isActive = !newStatus; // Revertir en caso de error
        this.snack.open('Error al cambiar estado', 'Cerrar');
      },
      complete: () => {
        this.applyFilters(); // Reaplicar filtros después del cambio
        this.snack.open(
          `Proveedor ${newStatus ? 'activado' : 'desactivado'}`,
          'Cerrar',
          { duration: 2000 }
        );
      }
    });
  }
  
  filterSuppliers(): void {
    if (!this.search.trim()) {
      this.filteredSuppliers = [...this.suppliers];
      return;
    }

    const searchTerm = this.search.toLowerCase().trim();
    this.filteredSuppliers = this.suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(searchTerm) ||
      (supplier.contactName && supplier.contactName.toLowerCase().includes(searchTerm)) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm)) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm)) ||
      (supplier.address && supplier.address.toLowerCase().includes(searchTerm))
    );
  }

  

  deleteSupplier(id: number): void {
    if (!confirm('¿Eliminar este proveedor?')) return;

    this.supplierService.delete(id).subscribe({
      next: () => {
        this.snack.open('Proveedor eliminado', 'Cerrar', { duration: 2000 });
        this.loadSuppliers();
      },
      error: () => this.snack.open('Error al eliminar', 'Cerrar')
    });
  }

  newSupplier(): void {
    const ref = this.dialog.open(SupplierFormComponent);

    ref.afterClosed().subscribe((refresh) => {
      if (refresh) this.loadSuppliers();
    });
  }

  editSupplier(supplier: Supplier): void {
    const ref = this.dialog.open(SupplierFormComponent, {
      data: {
        editMode: true,
        supplier: supplier
      }
    });

    ref.afterClosed().subscribe((refresh) => {
      if (refresh) this.loadSuppliers();
    });
  }
}

