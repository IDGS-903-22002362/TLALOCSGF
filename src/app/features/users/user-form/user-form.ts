import { Component, inject }           from '@angular/core';
import { CommonModule }                from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router }      from '@angular/router';
import { MatFormFieldModule }          from '@angular/material/form-field';
import { MatInputModule }              from '@angular/material/input';
import { MatSlideToggleModule }        from '@angular/material/slide-toggle';
import { MatButtonModule }             from '@angular/material/button';

import { UsersService }                from '../../../core/services/users';
import { UserUpdate }                  from '../../../models/users';

@Component({
  selector   : 'user-form',
  standalone : true,
  imports    : [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule
  ],
  templateUrl: './user-form.html'
})
export class UserFormComponent {

  /* ────────── inyecciones ────────── */
  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private users  = inject(UsersService);

  /* ────────── props ────────── */
  id   = this.route.snapshot.params['id'];
  form = this.fb.nonNullable.group({
  fullName:      this.fb.control('',            { validators: [Validators.required] }),
  phoneNumber:   this.fb.control<string | null>(null),
  isActive:      this.fb.control(true)
});

  /* ────────── ciclo ────────── */
  ngOnInit(): void {
    this.users.detail(this.id).subscribe(u => this.form.patchValue({
      fullName   : u.fullName,
      phoneNumber: u.phoneNumber ?? null,
      isActive   : u.isActive
    }));
  }

  /* ────────── persistencia ────────── */
  save(): void {
    if (this.form.invalid) return;

    this.users.update(this.id, this.form.getRawValue())
      .subscribe({
        next : () => this.router.navigate(['/users', this.id]),
        error: err => console.error(err)
      });
  }
}
