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
  <section class="max-w-5xl mx-auto p-6">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold">Mis tickets</h1>
    <div class="flex gap-2">
      <select class="border rounded px-3 py-2" [(ngModel)]="status" (change)="load()">
        <option value="">Todos</option>
        <option>Open</option>
        <option>In Progress</option>
        <option>Closed</option>
      </select>
      <input class="border rounded px-3 py-2" [(ngModel)]="q" (keyup.enter)="load()" placeholder="Buscar...">
      <button class="px-3 py-2 border rounded" (click)="clear()">Limpiar</button>
    </div>
  </div>

  <div class="bg-white rounded border p-4 mb-6">
    <h2 class="font-semibold mb-3">Crear ticket</h2>
    <form [formGroup]="form" (ngSubmit)="create()">
      <div class="grid md:grid-cols-2 gap-3">
        <input class="border rounded px-3 py-2" placeholder="Asunto" formControlName="subject">
        <textarea rows="3" class="border rounded px-3 py-2 md:col-span-2" placeholder="Describe tu problema" formControlName="message"></textarea>
      </div>
      <div class="mt-3">
        <button class="bg-green-600 text-white rounded px-4 py-2" [disabled]="form.invalid || busy">
          {{ busy ? 'Enviando…' : 'Enviar' }}
        </button>
        <span *ngIf="msg" class="ml-3 text-sm" [class.text-green-600]="ok" [class.text-red-600]="!ok">{{ msg }}</span>
      </div>
    </form>
  </div>

  <div class="overflow-x-auto border rounded">
    <table class="min-w-full text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="p-2 text-left">Asunto</th>
          <th class="p-2 text-center">Estado</th>
          <th class="p-2 text-center">Creado</th>
          <th class="p-2 text-center">Cerrado</th>
          <th class="p-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of items" class="border-t">
          <td class="p-2">{{ t.subject }}</td>
          <td class="p-2 text-center">
            <span class="px-2 py-0.5 rounded"
                  [class.bg-yellow-100]="t.status==='Open'"
                  [class.bg-blue-100]="t.status==='In Progress'"
                  [class.bg-green-100]="t.status==='Closed'">
              {{ t.status }}
            </span>
          </td>
          <td class="p-2 text-center">{{ t.createdAt | date:'short' }}</td>
          <td class="p-2 text-center">{{ t.closedAt ? (t.closedAt | date:'short') : '-' }}</td>
          <td class="p-2 text-center">
            <a [routerLink]="['/support/tickets', t.id]" class="text-green-700 hover:underline">Ver</a>
          </td>
        </tr>
        <tr *ngIf="items.length===0">
          <td colspan="5" class="p-4 text-center text-gray-500">Sin tickets</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

  `
})
export class TicketsMyComponent {
  /* filtros */
  status: string = '';
  q: string = '';

  /* datos */
  items: TicketDto[] = [];

  /* UI */
  busy = false;
  msg  = '';
  ok   = false;

  /* ✔️ inicializa fb ANTES de usarla y grupo NO anulable */
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

    const dto: CreateTicketDto = this.form.getRawValue(); // {subject:string; message:string}
    this.api.createTicket(dto).subscribe({
      next: _ => {
        this.busy = false; this.ok = true; this.msg = 'Ticket creado.';
        this.form.reset(); this.load();
      },
      error: _ => { this.busy = false; this.ok = false; this.msg = 'No se pudo crear'; }
    });
  }
}
