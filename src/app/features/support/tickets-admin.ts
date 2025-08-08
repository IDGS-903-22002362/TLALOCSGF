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
  <section class="max-w-6xl mx-auto p-6">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold">Tickets (Admin)</h1>
    <div class="flex gap-2">
      <select class="border rounded px-3 py-2" [(ngModel)]="status" (change)="goto(1)">
        <option value="">Todos</option>
        <option>Open</option>
        <option>In Progress</option>
        <option>Closed</option>
      </select>
      <input class="border rounded px-3 py-2" [(ngModel)]="q" (keyup.enter)="goto(1)" placeholder="Buscar...">
      <button class="px-3 py-2 border rounded" (click)="clear()">Limpiar</button>
    </div>
  </div>

  <div class="overflow-x-auto border rounded">
    <table class="min-w-full text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="p-2 text-left">Asunto</th>
          <th class="p-2 text-left">ClienteId</th>
          <th class="p-2 text-center">Estado</th>
          <th class="p-2 text-center">Creado</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of items" class="border-t">
          <td class="p-2">
            <a [routerLink]="['/support/tickets', t.id]" class="text-green-700 hover:underline">
              {{ t.subject }}
            </a>
          </td>
          <td class="p-2">{{ t.customerId }}</td>
          <td class="p-2 text-center">
            <span class="px-2 py-0.5 rounded"
                  [class.bg-yellow-100]="t.status==='Open'"
                  [class.bg-blue-100]="t.status==='In Progress'"
                  [class.bg-green-100]="t.status==='Closed'">
              {{ t.status }}
            </span>
          </td>
          <td class="p-2 text-center">{{ t.createdAt | date:'short' }}</td>
          <td class="p-2 text-right">
            <select class="border rounded px-2 py-1"
                    [ngModel]="t.status"
                    (ngModelChange)="changeStatus(t, $event)">
              <option>Open</option>
              <option>In Progress</option>
              <option>Closed</option>
            </select>
          </td>
        </tr>
        <tr *ngIf="items.length===0">
          <td colspan="5" class="p-4 text-center text-gray-500">Sin resultados</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="mt-3 flex items-center justify-between">
    <div class="text-sm text-gray-600">
      Página {{ page }} de {{ totalPages }} — {{ total }} registros
    </div>
    <div class="flex gap-2">
      <button class="px-3 py-1 border rounded" (click)="prev()" [disabled]="page<=1">Anterior</button>
      <button class="px-3 py-1 border rounded" (click)="next()" [disabled]="page>=totalPages">Siguiente</button>
      <select class="border rounded px-2 py-1"
              [(ngModel)]="pageSize"
              (change)="goto(1)">
        <option [ngValue]="10">10</option>
        <option [ngValue]="20">20</option>
        <option [ngValue]="50">50</option>
      </select>
    </div>
  </div>

  <p *ngIf="msg" class="mt-2 text-sm" [class.text-green-600]="ok" [class.text-red-600]="!ok">{{ msg }}</p>
</section>

  `
})
export class TicketsAdminComponent {
  items: TicketDto[] = [];

  page = 1;
  pageSize = 10;             // 👈 number
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
