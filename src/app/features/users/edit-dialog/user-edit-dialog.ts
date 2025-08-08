import { Component, Inject }                   from '@angular/core';
import { FormBuilder, Validators, FormGroup,FormControl,ReactiveFormsModule }  from '@angular/forms';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogRef, MAT_DIALOG_DATA }       from '@angular/material/dialog';
import { UserWithRoles, UserUpdate }           from '../../../models/users';
import { UsersService }                        from '../../../core/services/users';

@Component({
  selector: 'user-edit-dialog',
  standalone: true,
  imports: [    MatFormFieldModule,
              MatSlideToggleModule,
              ReactiveFormsModule
  ],
  templateUrl: './user-edit-dialog.html',
  styleUrls  : ['./user-edit-dialog.css'],
})
export class UserEditDialogComponent  {

  f!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private users: UsersService,
    private ref: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserWithRoles          
  ) { }

 ngOnInit(): void {
  this.f = this.fb.nonNullable.group({
    fullName   : [ this.data.fullName,    Validators.required ],
    phoneNumber: [ this.data.phoneNumber ?? '' ],
    isActive   : [ this.data.isActive ]
  });
}

  save(): void {
  if (this.f.invalid) return;

  this.users.update(this.data.id, this.f.getRawValue())   
      .subscribe({
        next : () => this.ref.close(true),
        error: () => this.ref.close(false)
      });
}
}
