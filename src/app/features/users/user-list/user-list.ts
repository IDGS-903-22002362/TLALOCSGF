// src/app/features/users/user-list/user-list.ts
import { Component, inject } from '@angular/core';
import { NgFor, AsyncPipe }  from '@angular/common';

import { MatTableModule }       from '@angular/material/table';
import { MatPaginatorModule, PageEvent }   from '@angular/material/paginator';
import { MatDialog, MatDialogModule }      from '@angular/material/dialog';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule }      from '@angular/material/button';
import { MatIconModule }        from '@angular/material/icon';
import { MatRadioModule }       from '@angular/material/radio';
import { MatChipsModule }       from '@angular/material/chips';   // ←  ✅

import { SelectionModel }       from '@angular/cdk/collections';
import { UsersService }         from '../../../core/services/users';
import { RoleDialogComponent }  from '../role-dialog/role-dialog';
import { UserEditDialogComponent } from '../edit-dialog/user-edit-dialog'; // si lo tienes
import { UserWithRoles, UserQuery } from '../../../models/users';

@Component({
  selector   : 'users-list',
  standalone : true,
  imports    : [
    NgFor, AsyncPipe,
    /* Material */
    MatTableModule, MatPaginatorModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSlideToggleModule,
    MatButtonModule, MatIconModule, MatRadioModule, MatChipsModule, // ←  ✅
    RoleDialogComponent
  ],
  templateUrl: './user-list.html',
})
export class UserListComponent {

  /* ────────── datos ────────── */
  private readonly usersSvc = inject(UsersService);
  private readonly dialog   = inject(MatDialog);

  data:  UserWithRoles[] = [];
  total = 0;
  query: UserQuery = { page: 1, pageSize: 10 };

  cols      = ['select','fullName','email','roles','active','actions'];
  selection = new SelectionModel<UserWithRoles>(false);   // seleccionar 1 fila

  ngOnInit() { this.load(); }

  load() {
    this.usersSvc.list(this.query).subscribe(res => this.data = res);
  }

  pageChange(e: PageEvent) {
    this.query.page     = e.pageIndex + 1;
    this.query.pageSize = e.pageSize;
    this.load();
  }

  apply(ev: Event) {
    const val = (ev.target as HTMLInputElement).value.trim().toLowerCase();
    this.data = this.data.filter(u =>
         u.fullName.toLowerCase().includes(val) ||
         u.email   .toLowerCase().includes(val));
  }

  /* ────────── botones/acciones ────────── */

  /** diálogo para cambiar rol */
  openRole(): void {
    const user = this.selection.selected[0];
    if (!user) return;

    this.dialog.open(RoleDialogComponent, { data: user })
        .afterClosed().subscribe(ok => ok && this.load());
  }

  /** diálogo de edición */
  openEdit(): void {
    const user = this.selection.selected[0];
    if (!user) return;

    this.dialog.open(UserEditDialogComponent, { data: user })
        .afterClosed().subscribe(ok => ok && this.load());
  }

  /** deshabilitar usuario (soft-delete) */
  disable(): void {
    const user = this.selection.selected[0];
    if (!user) return;
    if (!confirm(`¿Deshabilitar a ${user.fullName}?`)) return;

    this.usersSvc.disable(user.id).subscribe(() => this.load());
  }
}
