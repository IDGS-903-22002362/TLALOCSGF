import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Supplier, SupplierService, SupplierCreateDto, SupplierUpdateDto } from '../../core/services/suppliers';

@Component({
  standalone: true,
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.html',
  styleUrls: ['./supplier-form.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
})
export class SupplierFormComponent {
  form: FormGroup;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SupplierFormComponent>,
    private supplierService: SupplierService,
    @Inject(MAT_DIALOG_DATA) public data: { editMode: boolean; supplier: Supplier }
  ) {
    this.editMode = data?.editMode || false;

    this.form = this.fb.group({
      name: [data?.supplier?.name || '', Validators.required],
      contactName: [data?.supplier?.contactName || '', Validators.required],
      email: [data?.supplier?.email || '', [Validators.required, Validators.email]],
      phone: [data?.supplier?.phone || '', Validators.required],
      address: [data?.supplier?.address || '', Validators.required],
      isActive: [data?.supplier?.isActive || true] // Añadido para consistencia
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    if (this.editMode) {
      const dto: SupplierUpdateDto = {
        supplierId: this.data.supplier.supplierId,
        ...formValue
      };
      this.supplierService.update(dto).subscribe({
        next: () => this.dialogRef.close(true),
        error: () => alert('Error al actualizar proveedor'),
      });
    } else {
      const dto: SupplierCreateDto = {
        ...formValue
      };
      this.supplierService.create(dto).subscribe({
        next: () => this.dialogRef.close(true),
        error: () => alert('Error al crear proveedor'),
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}



