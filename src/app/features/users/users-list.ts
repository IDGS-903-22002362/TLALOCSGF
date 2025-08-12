import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UsersService, UserSummary, UserCreateDto, UserUpdateDto } from '../../core/services/users';

@Component({
  standalone: true,
  selector: 'app-users-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
  <section class="bg-emerald-50/60 min-h-[80vh]">
    <div class="mx-auto max-w-6xl px-6 py-10">

      <!-- Header + filtros -->
      <header class="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h1 class="text-3xl font-extrabold text-gray-900">Usuarios</h1>

        <div class="flex flex-wrap items-end gap-2">
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-3 my-auto text-gray-400">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clip-rule="evenodd"/>
              </svg>
            </span>
            <input
              class="w-64 rounded-2xl border border-gray-300 bg-white/90 px-10 py-2.5 text-gray-800 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
              type="text" [(ngModel)]="search" placeholder="Buscar nombre o correo" (keyup.enter)="reload()" />
            <button *ngIf="search"
              class="absolute right-2 inset-y-0 my-auto rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
              (click)="search=''; reload()">
              Limpiar
            </button>
          </div>

          <select
            class="rounded-xl border border-gray-300 bg-white/90 px-3 py-2 text-gray-800 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            [(ngModel)]="role" (change)="reload()">
            <option value="">Todos los roles</option>
            <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
          </select>

          <select
            class="rounded-xl border border-gray-300 bg-white/90 px-3 py-2 text-gray-800 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            [(ngModel)]="activeStr" (change)="reload()">
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <button
            class="rounded-xl border px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50"
            (click)="clearFilters()">
            Limpiar
          </button>

          <button
            class="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white shadow-md transition
                   hover:scale-[1.01] hover:bg-emerald-600 active:scale-95"
            (click)="openCreate()">
            Nuevo
          </button>
        </div>
      </header>

      <!-- Tabla -->
      <div class="overflow-hidden rounded-2xl border bg-white/80 backdrop-blur shadow ring-1 ring-black/5">
        <table class="w-full table-auto text-sm text-gray-800">
          <thead class="bg-gray-50/80 text-gray-600">
            <tr>
              <th class="p-3 text-left font-semibold">Nombre</th>
              <th class="p-3 text-left font-semibold">Correo</th>
              <th class="p-3 text-left font-semibold">Rol(es)</th>
              <th class="p-3 text-center font-semibold">Estado</th>
              <th class="p-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of items" class="border-t hover:bg-gray-50/60">
              <td class="p-3">{{ u.fullName }}</td>
              <td class="p-3">{{ u.email }}</td>
              <td class="p-3">
                <span class="inline-flex flex-wrap gap-1">
                  <span *ngFor="let r of u.roles"
                        class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                    {{ r }}
                  </span>
                </span>
              </td>
              <td class="p-3 text-center">
                <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      [ngClass]="u.isActive
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-700'">
                  {{ u.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="p-3 text-right">
                <div class="inline-flex flex-wrap items-center gap-3">
                  <button class="text-blue-600 hover:underline" (click)="openEdit(u)">Editar</button>
                  <button class="text-indigo-600 hover:underline" (click)="openRole(u)">Rol</button>
                  <button class="text-amber-700 hover:underline" (click)="reset(u)" [disabled]="busy">Reset pass</button>
                  <button class="text-red-600 hover:underline" *ngIf="u.isActive" (click)="deactivate(u)" [disabled]="busy">Desactivar</button>
                  <button class="text-emerald-700 hover:underline" *ngIf="!u.isActive" (click)="activate(u)" [disabled]="busy">Activar</button>
                </div>
              </td>
            </tr>

            <tr *ngIf="items.length === 0">
              <td colspan="5" class="p-6 text-center text-gray-600">Sin resultados</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="text-sm text-gray-600">
          Página {{ page }} de {{ totalPages }} — {{ total }} registros
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded-xl border px-3 py-1.5 text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            (click)="prev()" [disabled]="page<=1">Anterior</button>
          <button
            class="rounded-xl border px-3 py-1.5 text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            (click)="next()" [disabled]="page>=totalPages">Siguiente</button>
          <select
            class="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-800 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            [(ngModel)]="pageSize" (change)="goto(1)">
            <option [value]="10">10</option>
            <option [value]="20">20</option>
            <option [value]="50">50</option>
          </select>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="msg"
           class="mt-3 rounded-xl border px-3 py-2 text-sm"
           [ngClass]="ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'">
        {{ msg }}
      </div>
    </div>

    <!-- MODAL: CREAR -->
    <div *ngIf="showCreate" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div class="w-full max-w-md rounded-2xl border bg-white/90 backdrop-blur p-5 shadow-xl ring-1 ring-black/10">
        <h3 class="mb-3 text-lg font-semibold text-gray-900">Nuevo usuario</h3>

        <form [formGroup]="createForm" (ngSubmit)="confirmCreate()" class="space-y-3">
          <input class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                        focus:outline-none focus:ring-2 focus:ring-emerald-500"
                 placeholder="Nombre completo" formControlName="fullName">

          <input type="email" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                        focus:outline-none focus:ring-2 focus:ring-emerald-500"
                 placeholder="Correo" formControlName="email">

          <input class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                        focus:outline-none focus:ring-2 focus:ring-emerald-500"
                 placeholder="Teléfono (opcional)" formControlName="phoneNumber">

          <select class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  formControlName="role">
            <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
          </select>

          <input type="text" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                        focus:outline-none focus:ring-2 focus:ring-emerald-500"
                 placeholder="Contraseña (opcional)" formControlName="password">

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" class="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50" (click)="closeCreate()">Cancelar</button>
            <button class="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white shadow-sm transition
                           hover:scale-[1.01] hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                    [disabled]="createForm.invalid || busy">Crear</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: EDITAR -->
    <div *ngIf="showEdit" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div class="w-full max-w-md rounded-2xl border bg-white/90 backdrop-blur p-5 shadow-xl ring-1 ring-black/10">
        <h3 class="mb-3 text-lg font-semibold text-gray-900">Editar usuario</h3>

        <form [formGroup]="editForm" (ngSubmit)="confirmEdit()" class="space-y-3">
          <input class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                        focus:outline-none focus:ring-2 focus:ring-emerald-500"
                 placeholder="Nombre completo" formControlName="fullName">

          <input class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                        focus:outline-none focus:ring-2 focus:ring-emerald-500"
                 placeholder="Teléfono (opcional)" formControlName="phoneNumber">

          <label class="inline-flex items-center gap-2 text-gray-800">
            <input type="checkbox" formControlName="isActive"
                   class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500">
            <span>Activo</span>
          </label>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" class="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50" (click)="closeEdit()">Cancelar</button>
            <button class="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition
                           hover:scale-[1.01] hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                    [disabled]="editForm.invalid || busy">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: CAMBIAR ROL -->
    <div *ngIf="showRole" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div class="w-full max-w-sm rounded-2xl border bg-white/90 backdrop-blur p-5 shadow-xl ring-1 ring-black/10">
        <h3 class="mb-3 text-lg font-semibold text-gray-900">Cambiar rol</h3>

        <select class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
                [(ngModel)]="roleToSet">
          <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
        </select>

        <div class="pt-3 flex justify-end gap-2">
          <button class="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50" (click)="closeRole()">Cancelar</button>
          <button class="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition
                         hover:scale-[1.01] hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
                  (click)="confirmRole()" [disabled]="busy">Actualizar</button>
        </div>
      </div>
    </div>

  </section>
  `,
})
export class UsersListComponent implements OnInit {
  items: UserSummary[] = [];
  roles: string[] = [];

  page = 1;
  pageSize = 10;
  total = 0;
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  role = '';
  activeStr = '';
  get activeBool(): boolean | undefined {
    return this.activeStr === '' ? undefined : this.activeStr === 'true';
  }
  search = '';

  busy = false;
  msg = ''; ok = false;

  showCreate = false;
  showEdit   = false;
  showRole   = false;

  selected?: UserSummary;
  roleToSet = '';

  createForm!: FormGroup;
  editForm!: FormGroup;

  constructor(private api: UsersService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      fullName:    ['', Validators.required],
      email:       ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      role:        ['Client', Validators.required],
      password:    ['']
    });

    this.editForm = this.fb.group({
      fullName:    ['', Validators.required],
      phoneNumber: [''],
      isActive:    [true]
    });

    this.loadRoles();
    this.reload();
  }

  loadRoles() { this.api.roles().subscribe({ next: r => this.roles = r }); }

  reload() {
    this.api.list({
      page: this.page,
      pageSize: this.pageSize,
      role: this.role || undefined,
      active: this.activeBool,
      search: this.search || undefined
    }).subscribe({
      next: res => { this.items = res.items; this.total = res.total; },
      error: () => this.toast(false, 'No se pudo cargar la lista')
    });
  }

  clearFilters() { this.search = ''; this.role = ''; this.activeStr = ''; this.goto(1); }

  prev(){ if (this.page > 1) this.goto(this.page - 1); }
  next(){ if (this.page < this.totalPages) this.goto(this.page + 1); }
  goto(p: number){ this.page = p; this.reload(); }

  openCreate(){ this.createForm.reset({ role: 'Client' }); this.showCreate = true; }
  closeCreate(){ this.showCreate = false; }
  confirmCreate(){
    if (this.createForm.invalid) return;
    this.busy = true;
    this.api.create(this.createForm.getRawValue() as UserCreateDto).subscribe({
      next: () => { this.busy = false; this.showCreate = false; this.toast(true, 'Usuario creado y correo enviado'); this.reload(); },
      error: (e) => { this.busy = false; this.toast(false, e?.error ?? 'No se pudo crear'); }
    });
  }

  openEdit(u: UserSummary){
    this.selected = u;
    this.editForm.reset({
      fullName: u.fullName,
      phoneNumber: u.phone ?? '',
      isActive: u.isActive
    });
    this.showEdit = true;
  }
  closeEdit(){ this.showEdit = false; }
  confirmEdit(){
    if (!this.selected || this.editForm.invalid) return;
    this.busy = true;
    const dto: UserUpdateDto = this.editForm.getRawValue() as UserUpdateDto;
    this.api.update(this.selected.id, dto).subscribe({
      next: () => { this.busy = false; this.showEdit = false; this.toast(true,'Cambios guardados'); this.reload(); },
      error: () => { this.busy = false; this.toast(false,'No se pudo actualizar'); }
    });
  }

  openRole(u: UserSummary){ this.selected = u; this.roleToSet = u.roles[0] ?? 'Client'; this.showRole = true; }
  closeRole(){ this.showRole = false; }
  confirmRole(){
    if (!this.selected) return;
    this.busy = true;
    this.api.changeRole(this.selected.id, this.roleToSet).subscribe({
      next: () => { this.busy = false; this.showRole = false; this.toast(true,'Rol actualizado'); this.reload(); },
      error: () => { this.busy = false; this.toast(false,'No se pudo cambiar el rol'); }
    });
  }

  deactivate(u: UserSummary){
    this.busy = true;
    this.api.deactivate(u.id).subscribe({
      next: () => { this.busy = false; this.toast(true,'Usuario desactivado'); this.reload(); },
      error: () => { this.busy = false; this.toast(false,'No se pudo desactivar'); }
    });
  }
  activate(u: UserSummary){
    this.busy = true;
    this.api.activate(u.id).subscribe({
      next: () => { this.busy = false; this.toast(true,'Usuario activado'); this.reload(); },
      error: () => { this.busy = false; this.toast(false,'No se pudo activar'); }
    });
  }

  reset(u: UserSummary){
    this.busy = true;
    this.api.resetPassword(u.id).subscribe({
      next: () => { this.busy = false; this.toast(true,'Contraseña temporal enviada por correo'); },
      error: () => { this.busy = false; this.toast(false,'No se pudo restablecer'); }
    });
  }

  private toast(ok: boolean, msg: string){ this.ok = ok; this.msg = msg; setTimeout(()=> this.msg='', 4000); }
}
