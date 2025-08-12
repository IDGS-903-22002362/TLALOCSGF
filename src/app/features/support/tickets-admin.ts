import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService, TicketDto, PagedResult } from '../../core/services/support';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-tickets-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <section class="bg-emerald-50/60 min-h-[80vh]">
    <div class="mx-auto max-w-6xl px-6 py-10">

      <!-- Header + Filtros -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-3xl font-extrabold text-gray-900">Tickets (Admin)</h1>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Estado -->
          <select
            class="rounded-xl border border-gray-300 bg-white/90 px-3 py-2 text-gray-800 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            [(ngModel)]="status" (change)="goto(1)">
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
              [(ngModel)]="q" (keyup.enter)="goto(1)" placeholder="Buscar..." />
            <button *ngIf="q"
              class="absolute right-2 inset-y-0 my-auto rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
              (click)="clear()">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="overflow-hidden rounded-2xl border bg-white/80 backdrop-blur shadow ring-1 ring-black/5">
        <table class="w-full table-auto text-sm text-gray-800">
          <thead class="bg-gray-50/80 text-gray-600">
            <tr>
              <th class="p-3 text-left font-semibold">Asunto</th>
              <th class="p-3 text-left font-semibold">ClienteId</th>
              <th class="p-3 text-center font-semibold">Estado</th>
              <th class="p-3 text-center font-semibold">Creado</th>
              <th class="p-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of items" class="border-t hover:bg-gray-50/60">
              <td class="p-3">
                <a [routerLink]="['/support/tickets', t.id]"
                   class="text-emerald-700 hover:underline">
                  {{ t.subject }}
                </a>
              </td>
              <td class="p-3">{{ t.customerId }}</td>
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
              <td class="p-3 text-right">
                <select
                  class="rounded-lg border border-gray-300 bg-white px-2 py-1 text-gray-800 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  [ngModel]="t.status"
                  (ngModelChange)="changeStatus(t, $event)">
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Closed</option>
                </select>
              </td>
            </tr>

            <tr *ngIf="items.length===0">
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
            <option [ngValue]="10">10</option>
            <option [ngValue]="20">20</option>
            <option [ngValue]="50">50</option>
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
  </section>
  `
})
export class TicketsAdminComponent {
  items: TicketDto[] = [];

  page = 1;
  pageSize = 10;
  total = 0;
  get totalPages(){ return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  status = '';
  q = '';
  busy = false; msg=''; ok=false;

  constructor(private api: SupportService) { this.load(); }

  load(){
    this.api.getTicketsAdmin({
      status: this.status || undefined,
      q: this.q || undefined,
      page: this.page,
      pageSize: this.pageSize
    }).subscribe({
      next: (res: PagedResult<TicketDto>) => { this.items = res.items; this.total = res.total; },
      error: _ => this.toast(false, 'No se pudo cargar')
    });
  }

  changeStatus(t: TicketDto, status: TicketDto['status']){
    if (t.status === status) return;
    this.busy = true;
    this.api.updateTicketStatus(t.id, status).subscribe({
      next: () => { this.busy=false; this.toast(true, 'Estado actualizado'); this.load(); },
      error: () => { this.busy=false; this.toast(false, 'No se pudo actualizar'); }
    });
  }

  goto(p:number){ this.page=p; this.load(); }
  prev(){ if(this.page>1) this.goto(this.page-1); }
  next(){ if(this.page<this.totalPages) this.goto(this.page+1); }
  clear(){ this.status=''; this.q=''; this.goto(1); }

  private toast(ok:boolean, msg:string){ this.ok=ok; this.msg=msg; setTimeout(()=>this.msg='', 3000); }
}
