import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup,Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterDto } from '../../core/services/auth';
import { RouterLink } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <h2 class="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
        Crear cuenta
      </h2>

      <form [formGroup]="form" (ngSubmit)="submit()"
            class="space-y-4 md:space-y-6">
        <!-- Full name -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Nombre completo
          </label>
          <input type="text" formControlName="fullName"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                        focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
                        dark:text-white">
        </div>

        <!-- Email -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Correo electrónico
          </label>
          <input type="email" formControlName="email"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                        focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
                        dark:text-white">
        </div>

        <!-- Password -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Contraseña
          </label>
          <input type="password" formControlName="password"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                        focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
                        dark:text-white">
        </div>

        <!-- Confirm -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Confirmar contraseña
          </label>
          <input type="password" formControlName="confirm"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                        focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
                        dark:text-white">
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
          {{ loading ? 'Creando...' : 'Registrar' }}
        </button>

        <!-- Switch to login -->
        <p class="text-sm font-light text-gray-500 dark:text-gray-400 text-center">
          ¿Ya tienes cuenta?
          <a routerLink="/auth/login" class="font-medium text-green-600 hover:underline">
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  </section>
  `,
  styles: [],
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        fullName: ['', Validators.required],
        email:    ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm:  ['', Validators.required],
      },
      { validators: this.matchPasswords }
    );
  }

  submit(): void {
    if (this.form.invalid) return;

    const dto: RegisterDto = {
      fullName: this.form.value.fullName!,
      email:    this.form.value.email!,
      password: this.form.value.password!,
    };

    this.loading = true;
    this.error = '';

    this.auth.register(dto).subscribe({
      next: () => this.router.navigateByUrl('/auth/login'),
      error: (e) => {
        this.error = e.error ?? 'No se pudo registrar';
        this.loading = false;
      },
    });
  }

  /* Matcher */
  private matchPasswords(group: FormGroup): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const conf = group.get('confirm')?.value;
    return pass === conf ? null : { mismatch: true };
  }
}