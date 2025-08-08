import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

import { AuthService, LoginDto } from '../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <h2 class="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
        Iniciar sesión
      </h2>

      <form [formGroup]="form" (ngSubmit)="submit()"
            class="space-y-4 md:space-y-6">

        <!-- Email -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Correo electrónico
          </label>
          <input type="email"
                 formControlName="email"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                        focus:ring-green-600 focus:border-green-600 block w-full p-2.5
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
                        dark:text-white" />
        </div>

        <!-- Password -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Contraseña
          </label>
          <input [type]="show ? 'text' : 'password'"
                 formControlName="password"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                        focus:ring-green-600 focus:border-green-600 block w-full p-2.5
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
                        dark:text-white" />
          <button type="button"
                  (click)="show = !show"
                  class="text-xs mt-1 text-green-600 hover:underline">
            {{ show ? 'Ocultar' : 'Mostrar' }} contraseña
          </button>
        </div>

        <!-- Error -->
        <p *ngIf="error"
           class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

        <!-- Submit -->
        <button type="submit"
                [disabled]="form.invalid || loading"
                class="w-full text-white bg-green-600 hover:bg-green-700
                       focus:ring-4 focus:outline-none focus:ring-green-300
                       font-medium rounded-lg text-sm px-5 py-2.5 text-center
                       dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>

        <!-- Link to register -->
        <p class="text-sm font-light text-gray-500 dark:text-gray-400 text-center">
          ¿No tienes cuenta?
          <a routerLink="/auth/register"
             class="font-medium text-green-600 hover:underline">
            Regístrate
          </a>
        </p>
      </form>
    </div>
  </section>
  `,
  styles: [],
})
export class AuthComponent {
  form: FormGroup;
  loading = false;
  error = '';
  show = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const creds = this.form.getRawValue() as LoginDto;

    this.auth.login(creds).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: () => {
        this.error = 'Credenciales incorrectas';
        this.loading = false;
      },
    });
  }
}