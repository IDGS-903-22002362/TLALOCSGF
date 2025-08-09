import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ProductService, Product, ProductCreateDto, ProductUpdateDto, MaterialBOM } from '../../core/services/products';

@Component({
  standalone: true,
  selector: 'app-products-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
  <section class="p-6 max-w-6xl mx-auto">
    <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
      <h1 class="text-2xl font-bold">Productos</h1>

      <div class="flex flex-wrap gap-2 items-end">
        <input class="border rounded px-3 py-2" type="text" [(ngModel)]="search" placeholder="Buscar por nombre" (keyup.enter)="reload()"/>
        <button class="px-4 py-2 bg-gray-100 border rounded" (click)="clearFilters()">Limpiar</button>
        <button class="px-4 py-2 bg-green-600 text-white rounded" (click)="openCreate()">Nuevo Producto</button>
      </div>
    </header>

    <!-- Tabla -->
    <div class="overflow-x-auto border rounded">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-2 text-left">SKU</th>
            <th class="p-2 text-left">Nombre</th>
            <th class="p-2 text-left">Descripción</th>
            <th class="p-2 text-left">Precio Base</th>
            <th class="p-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of items" class="border-t">
            <td class="p-2">{{ p.sku }}</td>
            <td class="p-2">{{ p.name }}</td>
            <td class="p-2">{{ p.description || '-' }}</td>
            <td class="p-2">{{ p.basePrice | currency }}</td>
            <td class="p-2 text-right">
              <div class="inline-flex gap-2">
                <button class="text-blue-600 hover:underline" (click)="openEdit(p)">Editar</button>
                <button class="text-indigo-600 hover:underline" (click)="showBOM(p)" [disabled]="busy">Materiales</button>
                <button class="text-red-600 hover:underline" (click)="delete(p)" [disabled]="busy">Eliminar</button>
              </div>
            </td>
          </tr>

          <tr *ngIf="items.length === 0">
            <td colspan="5" class="p-4 text-center text-gray-500">Sin resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal CREAR -->
    <div *ngIf="showCreate" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded p-4 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-3">Nuevo Producto</h3>
        <form [formGroup]="createForm" (ngSubmit)="confirmCreate()">
          <div class="space-y-3">
            <input class="w-full border rounded px-3 py-2" placeholder="SKU" formControlName="sku">
            <input class="w-full border rounded px-3 py-2" placeholder="Nombre" formControlName="name">
            <textarea class="w-full border rounded px-3 py-2" placeholder="Descripción (opcional)" formControlName="description"></textarea>
            <input class="w-full border rounded px-3 py-2" type="number" min="0" step="0.01" placeholder="Precio Base" formControlName="basePrice">
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
        <h3 class="text-lg font-semibold mb-3">Editar Producto</h3>
        <form [formGroup]="editForm" (ngSubmit)="confirmEdit()">
          <div class="space-y-3">
            <input class="w-full border rounded px-3 py-2" placeholder="SKU" formControlName="sku" readonly>
            <input class="w-full border rounded px-3 py-2" placeholder="Nombre" formControlName="name">
            <textarea class="w-full border rounded px-3 py-2" placeholder="Descripción (opcional)" formControlName="description"></textarea>
            <input class="w-full border rounded px-3 py-2" type="number" min="0" step="0.01" placeholder="Precio Base" formControlName="basePrice">
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="px-4 py-2 border rounded" (click)="closeEdit()">Cancelar</button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded" [disabled]="editForm.invalid || busy">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal LISTA DE MATERIALES (BOM) -->
    <div *ngIf="showBom" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded p-4 w-full max-w-lg">
        <h3 class="text-lg font-semibold mb-3">Lista de Materiales para {{selected?.name}}</h3>
        
        <div class="overflow-x-auto border rounded mb-4">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-2 text-left">Material</th>
                <th class="p-2 text-left">Cantidad</th>
                <th class="p-2 text-left">Unidad</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of bomItems" class="border-t">
                <td class="p-2">{{ m.name }}</td>
                <td class="p-2">{{ m.quantity }}</td>
                <td class="p-2">{{ m.unitOfMeasure }}</td>
              </tr>
              <tr *ngIf="bomItems.length === 0">
                <td colspan="3" class="p-4 text-center text-gray-500">No se han definido materiales</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end">
          <button class="px-4 py-2 bg-indigo-600 text-white rounded" (click)="closeBOM()">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Mensaje -->
    <p *ngIf="msg" class="mt-2 text-sm" [class.text-green-600]="ok" [class.text-red-600]="!ok">{{ msg }}</p>
  </section>
  `,
})
export class ProductsListComponent implements OnInit {
  // datos
  items: Product[] = [];
  bomItems: MaterialBOM[] = [];

  // filtros
  search = '';

  // UI state
  busy = false;
  msg = ''; ok = false;

  showCreate = false;
  showEdit = false;
  showBom = false;

  selected?: Product;

  // forms
  createForm!: FormGroup;
  editForm!: FormGroup;

  constructor(private api: ProductService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', Validators.required],
      description: [''],
      basePrice: [0, [Validators.required, Validators.min(0)]]
    });

    this.editForm = this.fb.group({
      productId: [''],
      sku: [''],
      name: ['', Validators.required],
      description: [''],
      basePrice: [0, [Validators.required, Validators.min(0)]]
    });

    this.reload();
  }

  /*──────────── Carga de datos ────────────*/
  reload() {
    this.busy = true;
    this.api.getAll(this.search).subscribe({
      next: (products) => {
        this.items = products;
        this.busy = false;
      },
      error: () => {
        this.toast(false, 'Error al cargar productos');
        this.busy = false;
      }
    });
  }

  clearFilters() {
    this.search = '';
    this.reload();
  }

  /*──────────── Crear Producto ────────────*/
  openCreate() {
    this.createForm.reset({ basePrice: 0 });
    this.showCreate = true;
  }

  closeCreate() {
    this.showCreate = false;
  }

  confirmCreate() {
    if (this.createForm.invalid) return;
    this.busy = true;
    this.api.create(this.createForm.value).subscribe({
      next: () => {
        this.busy = false;
        this.showCreate = false;
        this.toast(true, 'Producto creado');
        this.reload();
      },
      error: () => {
        this.busy = false;
        this.toast(false, 'Error al crear producto');
      }
    });
  }

  /*──────────── Editar Producto ────────────*/
  openEdit(product: Product) {
    this.selected = product;
    this.editForm.patchValue({
      productId: product.productId,
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      basePrice: product.basePrice
    });
    this.showEdit = true;
  }

  closeEdit() {
    this.showEdit = false;
  }

  confirmEdit() {
    if (!this.selected || this.editForm.invalid) return;
    this.busy = true;
    this.api.update(this.editForm.value).subscribe({
      next: () => {
        this.busy = false;
        this.showEdit = false;
        this.toast(true, 'Producto actualizado');
        this.reload();
      },
      error: () => {
        this.busy = false;
        this.toast(false, 'Error al actualizar producto');
      }
    });
  }

  /*──────────── Eliminar Producto ────────────*/
  delete(product: Product) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    this.busy = true;
    this.api.delete(product.productId).subscribe({
      next: () => {
        this.busy = false;
        this.toast(true, 'Producto eliminado');
        this.reload();
      },
      error: () => {
        this.busy = false;
        this.toast(false, 'Error al eliminar producto');
      }
    });
  }

  /*──────────── Lista de Materiales (BOM) ────────────*/
  showBOM(product: Product) {
    this.selected = product;
    this.busy = true;
    this.api.getBOM(product.productId).subscribe({
      next: (materials) => {
        this.bomItems = materials;
        this.showBom = true;
        this.busy = false;
      },
      error: () => {
        this.busy = false;
        this.toast(false, 'Error al cargar materiales');
      }
    });
  }

  closeBOM() {
    this.showBom = false;
    this.bomItems = [];
  }

  /*──────────── Helper ────────────*/
  private toast(ok: boolean, msg: string) {
    this.ok = ok;
    this.msg = msg;
    setTimeout(() => this.msg = '', 4000);
  }
}