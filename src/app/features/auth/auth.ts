import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule }      from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';

import { AuthService } from '../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class AuthComponent {
  /** se define como propiedad pero se instancia en el ctor */
  form!: FormGroup;

  loading = false;
  error   = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    /** ¡ahora FormBuilder ya está disponible! */
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  /*──────── submit ────────*/
  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error   = '';

    const creds = this.form.getRawValue() as { email: string; password: string };

    this.auth.login(creds).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: () => {
        this.error   = 'Credenciales incorrectas';
        this.loading = false;
      },
    });
  }
}
