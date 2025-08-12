import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router } from '@angular/router';

import { QuoteService } from '../../core/services/quotes';
import { Product }      from '../../models/product';
import { QuoteLine }    from '../../models/quote';

@Component({
  standalone: true,
  selector: 'app-quote-picker',
  imports: [CommonModule, FormsModule],
  template: `
  <section class="bg-emerald-50/60 min-h-[80vh]">
    <div class="max-w-6xl mx-auto px-6 py-10">
      

      <!-- Header -->
      <header class="mb-6">
        <h1 class="text-3xl font-extrabold text-gray-900">Cotizador</h1>
      </header>

      <!-- Buscador -->
      <div class="mb-6">
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-3 my-auto text-gray-400">
            <!-- lupa -->
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clip-rule="evenodd"/>
            </svg>
          </span>
          <input
            type="text"
            [(ngModel)]="search"
            (ngModelChange)="onSearchChange()"
            placeholder="Buscar producto..."
            class="w-full rounded-2xl border border-gray-200 bg-white/80 backdrop-blur px-10 py-3 text-gray-900 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          <button *ngIf="search"
            (click)="clearSearch()"
            class="absolute right-3 inset-y-0 my-auto rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100">
            Limpiar
          </button>
        </div>
      </div>

      <!-- Catálogo -->
      <div *ngIf="loadingProducts" class="grid gap-5 md:grid-cols-2">
        <!-- skeletons -->
        <div *ngFor="let s of [1,2,3,4]" class="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm animate-pulse">
          <div class="h-5 w-40 bg-gray-200 rounded mb-3"></div>
          <div class="h-4 w-24 bg-gray-200 rounded mb-4"></div>
          <div class="h-9 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div *ngIf="!loadingProducts && products().length === 0" class="rounded-2xl border bg-white/80 backdrop-blur p-8 text-center text-gray-600">
        No hay productos que coincidan con “{{ search }}”.
      </div>

      <div *ngIf="!loadingProducts && products().length"
           class="grid gap-5 md:grid-cols-2">
        <article *ngFor="let p of products()"
                 class="group relative isolate rounded-2xl border bg-white/80 backdrop-blur p-5 shadow-sm ring-1 ring-black/5
                        transition hover:-translate-y-0.5 hover:shadow-lg"
                 [ngClass]="{ 'ring-emerald-500 ring-2': qty(p.productId) > 0 }">

          <!-- encabezado -->
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ p.name }}</h2>
              <span class="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                {{ p.sku }}
              </span>
            </div>

            <!-- stepper -->
            <div class="flex items-center gap-2">
              <button (click)="dec(p)"
                class="h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm
                       transition hover:bg-gray-50 active:scale-95">−</button>
              <span class="w-6 text-center font-semibold text-gray-800">{{ qty(p.productId) }}</span>
              <button (click)="inc(p)"
                class="h-9 w-9 rounded-lg border border-emerald-500 bg-emerald-600 text-white shadow
                       transition hover:bg-emerald-500 active:scale-95">+</button>
            </div>
          </div>

          <!-- pie (opcional: mini descripción o tag) -->
          <div class="mt-3 text-sm text-gray-600">
            <ng-content select="[p-desc]"></ng-content>
          </div>
        </article>
      </div>

      <!-- Resumen -->
      <div class="mt-8 grid gap-5 md:grid-cols-3">
        <div class="md:col-span-2"></div>
        <aside class="rounded-2xl border bg-white/80 backdrop-blur p-5 shadow-sm ring-1 ring-black/5">
          <h3 class="mb-3 text-lg font-semibold text-gray-800">Resumen</h3>

          <ul *ngIf="cart().length; else emptyCart" class="space-y-2">
            <li *ngFor="let l of cart()" class="flex items-center justify-between text-sm">
              <span class="text-gray-700">{{ findName(l.productId) }}</span>
              <span class="inline-flex items-center gap-2">
                <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{{ l.quantity }}</span>
                <button (click)="decById(l.productId)" class="text-gray-400 hover:text-red-600">Quitar</button>
              </span>
            </li>
          </ul>

          <ng-template #emptyCart>
            <p class="text-gray-500 text-sm">Aún no has agregado productos.</p>
          </ng-template>

          <button
            class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-md transition
                   hover:scale-[1.01] hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
            [disabled]="cart().length === 0 || loading"
            (click)="submit()">
            {{ loading ? 'Enviando…' : 'Solicitar cotización' }}
            <span *ngIf="itemCount()"
                  class="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">{{ itemCount() }}</span>
          </button>

          <p *ngIf="error" class="mt-3 text-red-600 text-sm">{{ error }}</p>
        </aside>
      </div>

    </div>
  </section>
  `,
})
export class QuotePickerComponent {
  private _products = signal<Product[]>([]);
  products = this._products.asReadonly();

  private _cart = signal<QuoteLine[]>([]);
  cart = this._cart.asReadonly();

  search = '';
  loading = false;
  loadingProducts = false;
  error = '';

  // total de ítems en carrito
  itemCount = computed(() => this._cart().reduce((acc, l) => acc + l.quantity, 0));

  constructor(private qs: QuoteService, private router: Router) {
    this.loadProducts();
  }

  onSearchChange() {
    // Sencillo: recargar en cada cambio; si quieres, agrega debounce.
    this.loadProducts();
  }

  clearSearch() {
    this.search = '';
    this.loadProducts();
  }

  /* Cargar catálogo */
  loadProducts(): void {
    this.loadingProducts = true;
    this.error = '';
    this.qs.getProducts(this.search).subscribe({
      next: list => { this._products.set(list); this.loadingProducts = false; },
      error: () => { this.error = 'No se pudieron cargar productos'; this.loadingProducts = false; },
    });
  }

  /* helpers carrito */
  qty(id: number): number {
    return this._cart().find(l => l.productId === id)?.quantity ?? 0;
  }

  inc(p: Product): void {
    const lines = [...this._cart()];
    const line = lines.find(l => l.productId === p.productId);
    line ? (line.quantity += 1) : lines.push({ productId: p.productId, quantity: 1 });
    this._cart.set(lines);
  }

  dec(p: Product): void { this.decById(p.productId); }
  decById(id: number): void {
    const lines = [...this._cart()];
    const idx = lines.findIndex(l => l.productId === id);
    if (idx > -1) {
      lines[idx].quantity -= 1;
      if (lines[idx].quantity <= 0) lines.splice(idx, 1);
      this._cart.set(lines);
    }
  }

  findName(id: number): string {
    return this._products().find(p => p.productId === id)?.name ?? '';
  }

  /* Enviar */
  submit(): void {
    this.loading = true;
    this.error   = '';

    this.qs.createQuote({ lines: this._cart() }).subscribe({
      next: q => this.router.navigate(['/quotes', q.id]),
      error: () => { this.error = 'No se pudo enviar la cotización'; this.loading = false; },
    });
  }
}
