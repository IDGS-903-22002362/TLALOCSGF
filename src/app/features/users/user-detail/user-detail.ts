import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { UsersService } from '../../../core/services/users';
import { UserWithRoles } from '../../../models/users';
import { UserEditDialogComponent } from '../edit-dialog/user-edit-dialog';

@Component({
  selector: 'user-detail',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './user-detail.html'
})
export class UserDetailComponent {

  private users = inject(UsersService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private dialog = inject(MatDialog);

  user$ = this.users.detail(this.route.snapshot.paramMap.get('id')!);

  openEdit(user: UserWithRoles) {
    this.dialog.open(UserEditDialogComponent, { data: user })
        .afterClosed().subscribe(ok => ok && this.reload());
  }

  private reload() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.user$ = this.users.detail(id);
  }
}
