// src/app/features/support/faq-public.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportService, FaqDto } from '../../core/services/support';
import { FormsModule } from '@angular/forms'; // ⬅️ importa esto
import { RouterModule } from '@angular/router';




@Component({
  standalone: true,
  selector: 'app-faq-public',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <section class="min-h-[70vh] bg-emerald-50/60">
  <div class="mx-auto max-w-4xl px-6 py-10">

    <!-- Título -->
    <header class="mb-6">
      <h1 class="text-3xl font-extrabold text-gray-900">Preguntas frecuentes</h1>
      <p class="text-gray-600">Resuelve tus dudas más comunes.</p>
    </header>

    <!-- Buscador -->
    <div class="mb-6">
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 left-3 my-auto text-gray-400">
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clip-rule="evenodd"/>
          </svg>
        </span>
        <input
          [(ngModel)]="q"
          (ngModelChange)="filter()"
          placeholder="Buscar pregunta…"
          class="w-full rounded-2xl border border-gray-200 bg-white/80 backdrop-blur px-10 py-3 text-gray-900 shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
        <button *ngIf="q"
                (click)="clear()"
                class="absolute right-3 inset-y-0 my-auto rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100">
          Limpiar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="space-y-3">
      <div *ngFor="let s of [1,2,3]" class="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm animate-pulse">
        <div class="h-5 w-64 bg-gray-200 rounded mb-3"></div>
        <div class="h-4 w-80 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Vacío -->
    <div *ngIf="!loading && filtered.length === 0"
         class="rounded-2xl border bg-white/80 backdrop-blur p-6 text-center text-gray-600">
      No encontramos resultados para “{{ q }}”.
      <div class="mt-4">
        <a routerLink="/support/tickets"
           class="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white shadow-md transition
                  hover:scale-[1.01] hover:bg-emerald-600 active:scale-95">
          ¿No es lo que buscabas? Atiende una duda o problema aquí
        </a>
      </div>
    </div>

    <!-- Lista -->
    <div *ngIf="!loading && filtered.length" class="space-y-4">
      <details *ngFor="let f of filtered; trackBy: trackById"
               class="group rounded-2xl border bg-white/80 backdrop-blur shadow-sm ring-1 ring-black/5">
        <summary
          class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50">
          <span>{{ f.question }}</span>
          <svg class="h-4 w-4 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/>
          </svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-gray-700 whitespace-pre-line border-t">
          {{ f.answer }}
        </div>
      </details>
    </div>

    <!-- CTA soporte fija al final -->
    <div class="mt-8 rounded-2xl border bg-white/80 backdrop-blur p-5 shadow ring-1 ring-black/5
                flex flex-wrap items-center justify-between gap-3">
      <p class="text-gray-700">
        ¿No es lo que buscabas? <span class="text-gray-500">Podemos ayudarte.</span>
      </p>
      <a routerLink="/support/tickets"
         class="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white shadow-md transition
                hover:scale-[1.01] hover:bg-emerald-600 active:scale-95">
        Atiende una duda o problema aquí
      </a>
    </div>

  </div>
</section>

  `
})
export class FaqPublicComponent {
  faqs: FaqDto[] = [];
  filtered: FaqDto[] = [];
  loading = true;
  q = '';

  constructor(private api: SupportService) {
    this.api.getFaqs().subscribe({
      next: (d) => { this.faqs = d; this.filtered = d; this.loading = false; },
      error: () => { this.faqs = []; this.filtered = []; this.loading = false; }
    });
  }

  filter() {
    const q = this.q.trim().toLowerCase();
    this.filtered = !q
      ? this.faqs
      : this.faqs.filter(f =>
          f.question.toLowerCase().includes(q) ||
          (f.answer ?? '').toLowerCase().includes(q)
        );
  }

  clear() { this.q = ''; this.filtered = this.faqs; }

  trackById = (_: number, f: FaqDto) => f.id ?? f.question;
}
