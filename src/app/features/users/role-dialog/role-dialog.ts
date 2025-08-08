import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsersService } from '../../../core/services/users';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule, MatLabel,             // <- mat-form-field + mat-label
} from '@angular/material/form-field';
import { MatSelectModule }  from '@angular/material/select';
import { MatOptionModule }  from '@angular/material/core';   

@Component({
  selector: 'role-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatLabel                                  
  ],
  template: `
    <h2 mat-dialog-title>Cambiar rol</h2>
    <form [formGroup]="f" (ngSubmit)="save()">
      <mat-form-field>
        <mat-label>Nuevo rol</mat-label>
        <mat-select formControlName="role" required>
          <mat-option value="Admin">Admin</mat-option>
          <mat-option value="Client">Client</mat-option>
        </mat-select>
      </mat-form-field>

      <div mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-flat-button color="primary" type="submit">Guardar</button>
      </div>
    </form>
  `
})

export class RoleDialogComponent {
  private ref   = inject(MatDialogRef<RoleDialogComponent>);
  private users = inject(UsersService);
  data = inject(MAT_DIALOG_DATA) as { id: string; roles: string[] };

f = inject(FormBuilder).nonNullable.group({
  role: 'Client' as const           
});

  save() {
    const newRole = this.f.value.role!; 
    
   this.users.changeRole(this.data.id, newRole)
      .subscribe({
        next: () => this.ref.close(true),
        error: () => this.ref.close(false)
      });
  }
}
