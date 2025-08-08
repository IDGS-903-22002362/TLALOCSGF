import { Component, signal, computed, effect } from '@angular/core';
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
  <section class="p-6 max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Cotizador</h1>

    <!-- Búsqueda -->
    <div class="mb-4">
      <input type="text" [(ngModel)]="search"
             (keyup)="loadProducts()"
             placeholder="Buscar producto…"
             class="w-full p-2 border rounded" />
    </div>

    <!-- Catálogo -->
    <div class="grid md:grid-cols-2 gap-4">
      <div *ngFor="let p of products()"
           class="p-4 border rounded flex justify-between items-center">
        <div>
          <h2 class="font-semibold">{{ p.name }}</h2>
          <p class="text-sm text-gray-500">{{ p.sku }}</p>
        </div>

        <div class="flex items-center gap-2">
          <button class="px-2 py-1 border rounded"
                  (click)="dec(p)">−</button>
          <span>{{ qty(p.productId) }}</span>
          <button class="px-2 py-1 border rounded"
                  (click)="inc(p)">+</button>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="mt-6 p-4 border rounded">
      <h3 class="font-semibold mb-2">Resumen</h3>
      <ul>
        <li *ngFor="let l of cart()">
          {{ l.quantity }} × {{ findName(l.productId) }}
        </li>
      </ul>

      <button class="mt-4 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              [disabled]="cart().length === 0 || loading"
              (click)="submit()">
        {{ loading ? 'Enviando…' : 'Solicitar cotización' }}
      </button>

      <p *ngIf="error" class="text-red-600 mt-2">{{ error }}</p>
    </div>
  </section>
  `,
})
export class QuotePickerComponent {
  /* Signals */
  private _products = signal<Product[]>([]);
  products = this._products.asReadonly();

  private _cart = signal<QuoteLine[]>([]);
  cart = this._cart.asReadonly();

  search = '';
  loading = false;
  error   = '';

  constructor(private qs: QuoteService, private router: Router) {
    this.loadProducts();
  }

  /* Cargar catálogo */
  loadProducts(): void {
    this.qs.getProducts(this.search).subscribe({
      next: list => this._products.set(list),
      error: () => (this.error = 'No se pudieron cargar productos'),
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

  dec(p: Product): void {
    const lines = [...this._cart()];
    const idx = lines.findIndex(l => l.productId === p.productId);
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
      error: () => {
        this.error   = 'No se pudo enviar la cotización';
        this.loading = false;
      },
    });
  }
}
