// src/app/features/auth/request-access.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccessRequestsService } from '../../core/services/access-requests';

@Component({
  standalone: true,
  selector: 'app-request-access',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 class="text-2xl font-bold mb-4 text-center">Solicitar acceso</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <input class="w-full border rounded px-3 py-2" placeholder="Nombre completo (opcional)" formControlName="fullName">
        <input class="w-full border rounded px-3 py-2" placeholder="Correo" type="email" formControlName="email">
        <button class="w-full bg-green-600 text-white rounded px-4 py-2" [disabled]="form.invalid || sending">
          {{ sending ? 'Enviando…' : 'Solicitar credenciales' }}
        </button>
        <p *ngIf="msg" class="text-sm text-center" [class.text-green-600]="ok" [class.text-red-600]="!ok">{{ msg }}</p>
        <p class="text-center text-sm text-gray-500">Un administrador validará tu correo y te enviará las credenciales.</p>
        <p class="text-center text-sm"><a routerLink="/auth/login" class="text-green-600 hover:underline">Volver a iniciar sesión</a></p>
      </form>
    </div>
  </section>
  `
})
export class RequestAccessComponent implements OnInit {
  form!: FormGroup;
  sending = false; msg = ''; ok = false;

  constructor(private fb: FormBuilder, private api: AccessRequestsService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: [''],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.sending = true; this.msg = ''; this.ok = false;

    const { email, fullName } = this.form.getRawValue();
    this.api.request(email!, fullName || undefined).subscribe({
      next: () => { this.ok = true; this.msg = 'Solicitud enviada. Revisa tu correo próximamente.'; this.sending = false; },
      error: e => { this.ok = false; this.msg = e?.error ?? 'No se pudo enviar la solicitud.'; this.sending = false; }
    });
  }
}
