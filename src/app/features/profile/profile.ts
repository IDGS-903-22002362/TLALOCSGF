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
  <section class="min-h-[80vh] bg-emerald-50/60">
    <div class="mx-auto max-w-5xl px-6 py-10">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">Mi perfil</h1>
        <p class="text-gray-600">Gestiona tus datos y la seguridad de tu cuenta.</p>
      </header>

      <!-- Grid -->
      <div class="grid gap-8 md:grid-cols-2">
        <!-- Card Datos -->
        <div class="rounded-2xl border bg-white/80 backdrop-blur shadow-lg ring-1 ring-black/5">
          <div class="border-b px-6 py-4">
            <h2 class="text-lg font-semibold text-gray-800">Datos</h2>
          </div>

          <form [formGroup]="form" (ngSubmit)="saveProfile()"
                class="px-6 py-5 space-y-4"
                [class.opacity-60]="busy" [attr.aria-busy]="busy">
            <!-- Nombre -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Nombre completo</label>
              <input
                class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                formControlName="fullName" />
              <p *ngIf="form.get('fullName')?.invalid && form.get('fullName')?.touched"
                 class="mt-1 text-xs text-red-600">Este campo es obligatorio.</p>
            </div>

            <!-- Correo -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Correo</label>
              <input
                class="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600"
                [value]="profile?.email" disabled />
            </div>

            <!-- Teléfono -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                formControlName="phoneNumber" />
            </div>

            <!-- Estado -->
            <div *ngIf="msg1"
                 class="rounded-xl border px-3 py-2 text-sm"
                 [ngClass]="ok1
                   ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                   : 'border-red-200 bg-red-50 text-red-700'">
              {{ msg1 }}
            </div>

            <div class="pt-1">
              <button
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white shadow-md transition
                       hover:scale-[1.01] hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                [disabled]="form.invalid || busy">
                {{ busy ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Card Password -->
        <div class="rounded-2xl border bg-white/80 backdrop-blur shadow-lg ring-1 ring-black/5">
          <div class="border-b px-6 py-4">
            <h2 class="text-lg font-semibold text-gray-800">Cambiar contraseña</h2>
          </div>

          <form [formGroup]="pwdForm" (ngSubmit)="savePassword()"
                class="px-6 py-5 space-y-4"
                [class.opacity-60]="busy2" [attr.aria-busy]="busy2">

            <!-- Actual -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Contraseña actual</label>
              <div class="relative">
                <input [type]="showPwd1 ? 'text' : 'password'"
                  class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  formControlName="currentPassword" />
                <button type="button" (click)="showPwd1 = !showPwd1"
                        class="absolute inset-y-0 right-2 my-auto h-8 rounded-md px-2 text-gray-500 hover:bg-gray-100">
                  {{ showPwd1 ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
            </div>

            <!-- Nueva -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Nueva contraseña</label>
              <div class="relative">
                <input [type]="showPwd2 ? 'text' : 'password'"
                  class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  formControlName="newPassword" />
                <button type="button" (click)="showPwd2 = !showPwd2"
                        class="absolute inset-y-0 right-2 my-auto h-8 rounded-md px-2 text-gray-500 hover:bg-gray-100">
                  {{ showPwd2 ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">Debe cumplir la política de seguridad definida.</p>
            </div>

            <!-- Confirmar -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
              <input [type]="showPwd2 ? 'text' : 'password'"
                class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                formControlName="confirm" />
              <p *ngIf="pwdMismatch" class="mt-1 text-xs text-red-600">No coincide la confirmación.</p>
            </div>

            <!-- Estado -->
            <div *ngIf="msg2"
                 class="rounded-xl border px-3 py-2 text-sm"
                 [ngClass]="ok2
                   ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                   : 'border-red-200 bg-red-50 text-red-700'">
              {{ msg2 }}
            </div>

            <div class="pt-1">
              <button
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white shadow-md transition
                       hover:scale-[1.01] hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                [disabled]="pwdForm.invalid || pwdMismatch || busy2">
                {{ busy2 ? 'Actualizando…' : 'Actualizar contraseña' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
  `
})
export class ProfileComponent implements OnInit {
  profile?: UserProfile;

  form!: FormGroup;
  pwdForm!: FormGroup;

  showPwd1 = false;
  showPwd2 = false;

  get pwdMismatch() {
    if (!this.pwdForm) return false;
    const { newPassword, confirm } = this.pwdForm.getRawValue();
    return !!newPassword && !!confirm && newPassword !== confirm;
  }

  busy = false; msg1 = ''; ok1 = false;
  busy2 = false; msg2 = ''; ok2 = false;

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['']
    });

    this.pwdForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirm: ['', Validators.required]
    });

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
