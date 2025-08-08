// src/app/features/auth/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService, UserProfile, UpdateProfileDto, ChangePasswordDto } from '../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Mi perfil</h1>

    <!-- Datos básicos -->
    <div class="bg-white rounded shadow p-4 mb-6">
      <h2 class="font-semibold mb-3">Datos</h2>
      <form [formGroup]="form" (ngSubmit)="saveProfile()" class="space-y-3">
        <div>
          <label class="block text-sm mb-1">Nombre completo</label>
          <input class="w-full border rounded px-3 py-2" formControlName="fullName">
        </div>
        <div>
          <label class="block text-sm mb-1">Correo</label>
          <input class="w-full border rounded px-3 py-2 bg-gray-100" [value]="profile?.email" disabled>
        </div>
        <div>
          <label class="block text-sm mb-1">Teléfono</label>
          <input class="w-full border rounded px-3 py-2" formControlName="phoneNumber">
        </div>
        <div class="pt-2">
          <button class="px-4 py-2 bg-blue-600 text-white rounded" [disabled]="form.invalid || busy">
            {{ busy ? 'Guardando…' : 'Guardar' }}
          </button>
          <span *ngIf="msg1" class="ml-3 text-sm" [class.text-green-600]="ok1" [class.text-red-600]="!ok1">{{ msg1 }}</span>
        </div>
      </form>
    </div>

    <!-- Cambiar contraseña -->
    <div class="bg-white rounded shadow p-4">
      <h2 class="font-semibold mb-3">Cambiar contraseña</h2>
      <form [formGroup]="pwdForm" (ngSubmit)="savePassword()" class="space-y-3">
        <div>
          <label class="block text-sm mb-1">Contraseña actual</label>
          <input type="password" class="w-full border rounded px-3 py-2" formControlName="currentPassword">
        </div>
        <div>
          <label class="block text-sm mb-1">Nueva contraseña</label>
          <input type="password" class="w-full border rounded px-3 py-2" formControlName="newPassword">
          <p class="text-xs text-gray-500 mt-1">Debe cumplir la política de seguridad definida.</p>
        </div>
        <div>
          <label class="block text-sm mb-1">Confirmar nueva contraseña</label>
          <input type="password" class="w-full border rounded px-3 py-2" formControlName="confirm">
        </div>
        <div class="pt-2">
          <button class="px-4 py-2 bg-green-600 text-white rounded" [disabled]="pwdForm.invalid || pwdMismatch || busy2">
            {{ busy2 ? 'Actualizando…' : 'Actualizar contraseña' }}
          </button>
          <span *ngIf="pwdMismatch" class="ml-3 text-sm text-red-600">No coincide la confirmación.</span>
          <span *ngIf="msg2" class="ml-3 text-sm" [class.text-green-600]="ok2" [class.text-red-600]="!ok2">{{ msg2 }}</span>
        </div>
      </form>
    </div>
  </section>
  `
})
export class ProfileComponent implements OnInit {
  profile?: UserProfile;

  // Se crean en ngOnInit
  form!: FormGroup;
  pwdForm!: FormGroup;

  get pwdMismatch() {
    if (!this.pwdForm) return false;
    const { newPassword, confirm } = this.pwdForm.getRawValue();
    return !!newPassword && !!confirm && newPassword !== confirm;
  }

  busy = false; msg1 = ''; ok1 = false;
  busy2 = false; msg2 = ''; ok2 = false;

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  ngOnInit(): void {
    // Inicializar forms aquí (ya existe this.fb)
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['']
    });

    this.pwdForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirm: ['', Validators.required]
    });

    // Cargar perfil después de tener el form listo
    this.load();
  }

  private load() {
    this.auth.me().subscribe({
      next: p => {
        this.profile = p;
        this.form.reset({
          fullName: p.fullName,
          phoneNumber: p.phoneNumber ?? ''
        });
      }
    });
  }

  saveProfile() {
    if (this.form.invalid) return;
    this.busy = true; this.msg1 = ''; this.ok1 = false;

    const dto = this.form.getRawValue() as UpdateProfileDto;
    this.auth.updateMe(dto).subscribe({
      next: () => { this.ok1 = true; this.msg1 = 'Datos guardados.'; this.busy = false; this.load(); },
      error: e => { this.ok1 = false; this.msg1 = (e?.error ?? 'No se pudo guardar'); this.busy = false; }
    });
  }

  savePassword() {
    if (this.pwdForm.invalid || this.pwdMismatch) return;
    this.busy2 = true; this.msg2 = ''; this.ok2 = false;

    const { currentPassword, newPassword } = this.pwdForm.getRawValue();
    const dto: ChangePasswordDto = { currentPassword: currentPassword!, newPassword: newPassword! };

    this.auth.changePassword(dto).subscribe({
      next: () => { this.ok2 = true; this.msg2 = 'Contraseña actualizada.'; this.busy2 = false; this.pwdForm.reset(); },
      error: e => { this.ok2 = false; this.msg2 = (e?.error ?? 'No se pudo actualizar'); this.busy2 = false; }
    });
  }
}
