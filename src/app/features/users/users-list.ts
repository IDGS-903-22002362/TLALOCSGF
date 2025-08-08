import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UsersService, UserSummary, UserCreateDto, UserUpdateDto } from '../../core/services/users';

@Component({
  standalone: true,
  selector: 'app-users-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ],
  template: `
  <section class="p-6 max-w-6xl mx-auto">
    <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
      <h1 class="text-2xl font-bold">Usuarios</h1>

      <div class="flex flex-wrap gap-2 items-end">
        <input class="border rounded px-3 py-2" type="text" [(ngModel)]="search" placeholder="Buscar nombre o correo" (keyup.enter)="reload()"/>
        <select class="border rounded px-3 py-2" [(ngModel)]="role" (change)="reload()">
          <option value="">Todos los roles</option>
          <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
        </select>
        <select class="border rounded px-3 py-2" [(ngModel)]="activeStr" (change)="reload()">
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <button class="px-4 py-2 bg-gray-100 border rounded" (click)="clearFilters()">Limpiar</button>
        <button class="px-4 py-2 bg-green-600 text-white rounded" (click)="openCreate()">Nuevo</button>
      </div>
    </header>

    <!-- Tabla -->
    <div class="overflow-x-auto border rounded">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-2 text-left">Nombre</th>
            <th class="p-2 text-left">Correo</th>
            <th class="p-2 text-left">Rol(es)</th>
            <th class="p-2 text-center">Estado</th>
            <th class="p-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of items" class="border-t">
            <td class="p-2">{{ u.fullName }}</td>
            <td class="p-2">{{ u.email }}</td>
            <td class="p-2">
              <span class="inline-flex gap-1 flex-wrap">
                <span *ngFor="let r of u.roles" class="px-2 py-0.5 bg-gray-200 rounded">{{ r }}</span>
              </span>
            </td>
            <td class="p-2 text-center">
              <span [class.bg-green-100]="u.isActive" [class.text-green-700]="u.isActive"
                    [class.bg-red-100]="!u.isActive" [class.text-red-700]="!u.isActive"
                    class="px-2 py-0.5 inline-block rounded">
                {{ u.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="p-2 text-right">
              <div class="inline-flex gap-2">
                <button class="text-blue-600 hover:underline" (click)="openEdit(u)">Editar</button>
                <button class="text-indigo-600 hover:underline" (click)="openRole(u)">Rol</button>
                <button class="text-yellow-700 hover:underline" (click)="reset(u)" [disabled]="busy">Reset pass</button>
                <button class="text-red-600 hover:underline" *ngIf="u.isActive" (click)="deactivate(u)" [disabled]="busy">Desactivar</button>
                <button class="text-green-700 hover:underline" *ngIf="!u.isActive" (click)="activate(u)" [disabled]="busy">Activar</button>
              </div>
            </td>
          </tr>

          <tr *ngIf="items.length === 0">
            <td colspan="5" class="p-4 text-center text-gray-500">Sin resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="mt-3 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        Página {{ page }} de {{ totalPages }} — {{ total }} registros
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-1 border rounded" (click)="prev()" [disabled]="page<=1">Anterior</button>
        <button class="px-3 py-1 border rounded" (click)="next()" [disabled]="page>=totalPages">Siguiente</button>
        <select class="border rounded px-2 py-1" [(ngModel)]="pageSize" (change)="goto(1)">
          <option [value]="10">10</option>
          <option [value]="20">20</option>
          <option [value]="50">50</option>
        </select>
      </div>
    </div>

    <!-- Mensaje -->
    <p *ngIf="msg" class="mt-2 text-sm" [class.text-green-600]="ok" [class.text-red-600]="!ok">{{ msg }}</p>

    <!-- Modal CREAR -->
    <div *ngIf="showCreate" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded p-4 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-3">Nuevo usuario</h3>
        <form [formGroup]="createForm" (ngSubmit)="confirmCreate()">
          <div class="space-y-3">
            <input class="w-full border rounded px-3 py-2" placeholder="Nombre completo" formControlName="fullName">
            <input class="w-full border rounded px-3 py-2" placeholder="Correo" type="email" formControlName="email">
            <input class="w-full border rounded px-3 py-2" placeholder="Teléfono (opcional)" formControlName="phoneNumber">
            <select class="w-full border rounded px-3 py-2" formControlName="role">
              <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
            </select>
            <input class="w-full border rounded px-3 py-2" placeholder="Contraseña (opcional)" type="text" formControlName="password">
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="px-4 py-2 border rounded" (click)="closeCreate()">Cancelar</button>
            <button class="px-4 py-2 bg-green-600 text-white rounded" [disabled]="createForm.invalid || busy">Crear</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal EDITAR -->
    <div *ngIf="showEdit" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded p-4 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-3">Editar usuario</h3>
        <form [formGroup]="editForm" (ngSubmit)="confirmEdit()">
          <div class="space-y-3">
            <input class="w-full border rounded px-3 py-2" placeholder="Nombre completo" formControlName="fullName">
            <input class="w-full border rounded px-3 py-2" placeholder="Teléfono (opcional)" formControlName="phoneNumber">
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" formControlName="isActive"> <span>Activo</span>
            </label>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="px-4 py-2 border rounded" (click)="closeEdit()">Cancelar</button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded" [disabled]="editForm.invalid || busy">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal CAMBIAR ROL -->
    <div *ngIf="showRole" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded p-4 w-full max-w-sm">
        <h3 class="text-lg font-semibold mb-3">Cambiar rol</h3>
        <div class="space-y-3">
          <select class="w-full border rounded px-3 py-2" [(ngModel)]="roleToSet">
            <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
          </select>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button class="px-4 py-2 border rounded" (click)="closeRole()">Cancelar</button>
          <button class="px-4 py-2 bg-indigo-600 text-white rounded" (click)="confirmRole()" [disabled]="busy">Actualizar</button>
        </div>
      </div>
    </div>
  </section>
  `,
})
export class UsersListComponent implements OnInit {
  // datos
  items: UserSummary[] = [];
  roles: string[] = [];

  // filtros/paginación
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

  // UI state
  busy = false;
  msg = ''; ok = false;

  showCreate = false;
  showEdit   = false;
  showRole   = false;

  selected?: UserSummary;
  roleToSet = '';

  // forms (se inicializan en ngOnInit)
  createForm!: FormGroup;
  editForm!: FormGroup;

  constructor(private api: UsersService, private fb: FormBuilder) {}

  ngOnInit(): void {
    // construir forms aquí (ya existe this.fb)
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

    // cargar datos iniciales
    this.loadRoles();
    this.reload();
  }

  /* Carga */
  loadRoles() {
    this.api.roles().subscribe({ next: r => this.roles = r });
  }

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

  clearFilters() {
    this.search = ''; this.role = ''; this.activeStr = '';
    this.goto(1);
  }

  prev(){ if (this.page > 1) this.goto(this.page - 1); }
  next(){ if (this.page < this.totalPages) this.goto(this.page + 1); }
  goto(p: number){ this.page = p; this.reload(); }

  /* Crear */
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

  /* Editar */
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

  /* Rol */
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

  /* Activar / Desactivar */
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

  /* Reset pass */
  reset(u: UserSummary){
    this.busy = true;
    this.api.resetPassword(u.id).subscribe({
      next: () => { this.busy = false; this.toast(true,'Contraseña temporal enviada por correo'); },
      error: () => { this.busy = false; this.toast(false,'No se pudo restablecer'); }
    });
  }

  /* UI helper */
  private toast(ok: boolean, msg: string){ this.ok = ok; this.msg = msg; setTimeout(()=> this.msg='', 4000); }
}