import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SupportService, TicketDto, CreateTicketDto } from '../../core/services/support';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-tickets-my',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="bg-emerald-50/60 min-h-[80vh]">
    <div class="mx-auto max-w-6xl px-6 py-10">

      <!-- Header + Filtros -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-3xl font-extrabold text-gray-900">Mis tickets</h1>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Filtro de estado -->
          <select
            class="rounded-xl border border-gray-300 bg-white/90 px-3 py-2 text-gray-800 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            [(ngModel)]="status" (change)="load()">
            <option value="">Todos</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>

          <!-- Buscador -->
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-3 my-auto text-gray-400">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clip-rule="evenodd"/>
              </svg>
            </span>
            <input
              class="w-64 rounded-2xl border border-gray-300 bg-white/90 px-10 py-2.5 text-gray-800 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
              [(ngModel)]="q" (keyup.enter)="load()" placeholder="Buscar..." />
            <button *ngIf="q"
              class="absolute right-2 inset-y-0 my-auto rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
              (click)="clear()">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Crear ticket -->
      <div class="rounded-2xl border bg-white/80 backdrop-blur p-5 shadow ring-1 ring-black/5 mb-6">
        <h2 class="mb-4 text-lg font-semibold text-gray-800">Crear ticket</h2>

        <form [formGroup]="form" (ngSubmit)="create()" class="space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <input
              class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Asunto o duda" formControlName="subject">
            <textarea rows="3"
              class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 md:col-span-2
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Describe tu duda o problema" formControlName="message"></textarea>
          </div>

          <div *ngIf="msg"
               class="rounded-xl border px-3 py-2 text-sm"
               [ngClass]="ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'">
            {{ msg }}
          </div>

          <div class="pt-1">
            <button
              class="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white shadow-md transition
                     hover:scale-[1.01] hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
              [disabled]="form.invalid || busy">
              {{ busy ? 'Enviando…' : 'Enviar' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Tabla de tickets -->
      <div class="overflow-hidden rounded-2xl border bg-white/80 backdrop-blur shadow ring-1 ring-black/5">
        <table class="w-full table-auto text-sm text-gray-800">
          <thead class="bg-gray-50/80 text-gray-600">
            <tr>
              <th class="p-3 text-left font-semibold">Asunto</th>
              <th class="p-3 text-center font-semibold">Estado</th>
              <th class="p-3 text-center font-semibold">Creado</th>
              <th class="p-3 text-center font-semibold">Cerrado</th>
              <th class="p-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of items" class="border-t hover:bg-gray-50/60">
              <td class="p-3">{{ t.subject }}</td>
              <td class="p-3 text-center">
                <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      [ngClass]="{
                        'border-amber-200 bg-amber-50 text-amber-700': t.status==='Open',
                        'border-sky-200 bg-sky-50 text-sky-700': t.status==='In Progress',
                        'border-emerald-200 bg-emerald-50 text-emerald-700': t.status==='Closed'
                      }">
                  {{ t.status }}
                </span>
              </td>
              <td class="p-3 text-center">{{ t.createdAt | date:'short' }}</td>
              <td class="p-3 text-center">{{ t.closedAt ? (t.closedAt | date:'short') : '-' }}</td>
              <td class="p-3 text-center">
                <a [routerLink]="['/support/tickets', t.id]"
                   class="text-emerald-700 hover:underline">Ver</a>
              </td>
            </tr>

            <tr *ngIf="items.length===0">
              <td colspan="5" class="p-6 text-center text-gray-600">
                No hay tickets para mostrar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CTA si no hay resultados -->
      <div *ngIf="items.length===0" class="mt-6 rounded-2xl border bg-white/80 backdrop-blur p-5 shadow ring-1 ring-black/5
                   flex flex-wrap items-center justify-between gap-3">
        <p class="text-gray-700">¿Necesitas ayuda ?  genera un ticket.</p>
        
      </div>
    </div>
  </section>
  `
})
export class TicketsMyComponent {
  /* filtros */
  status = '';
  q = '';

  /* datos */
  items: TicketDto[] = [];

  /* UI */
  busy = false;
  msg  = '';
  ok   = false;

  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    subject: ['', Validators.required],
    message: ['', Validators.required]
  });

  constructor(private api: SupportService) {
    this.load();
  }

  load() {
    this.api.getMyTickets(this.status || undefined, this.q || undefined)
      .subscribe({ next: d => this.items = d });
  }

  clear() {
    this.status = '';
    this.q = '';
    this.load();
  }

  create() {
    if (this.form.invalid) return;
    this.busy = true; this.msg=''; this.ok=false;

    const dto: CreateTicketDto = this.form.getRawValue();
    this.api.createTicket(dto).subscribe({
      next: _ => {
        this.busy = false; this.ok = true; this.msg = 'Ticket creado.';
        this.form.reset(); this.load();
      },
      error: _ => { this.busy = false; this.ok = false; this.msg = 'No se pudo crear'; }
    });
  }
}
