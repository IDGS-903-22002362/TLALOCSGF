// src/app/features/requests/requests.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessRequestsService, AccessRequest } from '../../core/services/access-requests';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-requests',
  imports: [CommonModule, FormsModule],
  template: `
  <section class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Solicitudes de acceso</h1>
    <div class="mb-3">
      <select class="border rounded px-3 py-2" [(ngModel)]="status" (change)="load()">
        <option>Pending</option><option>Approved</option><option>Rejected</option>
      </select>
    </div>

    <div class="border rounded overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr><th class="p-2 text-left">Correo</th><th class="p-2 text-left">Nombre</th><th class="p-2">Creada</th><th class="p-2 text-right">Acciones</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of items" class="border-t">
            <td class="p-2">{{ r.email }}</td>
            <td class="p-2">{{ r.fullName || '-' }}</td>
            <td class="p-2">{{ r.createdAt | date:'short' }}</td>
            <td class="p-2 text-right">
              <button class="px-3 py-1 bg-green-600 text-white rounded mr-2" (click)="approve(r)" *ngIf="status==='Pending'">Aprobar</button>
              <button class="px-3 py-1 bg-red-600 text-white rounded" (click)="reject(r)" *ngIf="status==='Pending'">Rechazar</button>
            </td>
          </tr>
          <tr *ngIf="items.length===0"><td colspan="4" class="p-4 text-center text-gray-500">Sin solicitudes</td></tr>
        </tbody>
      </table>
    </div>

    <p *ngIf="msg" class="mt-2 text-sm" [class.text-green-600]="ok" [class.text-red-600]="!ok">{{ msg }}</p>
  </section>
  `
})
export class RequestsComponent {
  items: AccessRequest[] = [];
  status = 'Pending'; msg=''; ok=false; busy=false;
  constructor(private api: AccessRequestsService) { this.load(); }
  load(){ this.api.list(this.status).subscribe({ next: r => this.items = r }); }
  approve(r: AccessRequest){
  this.busy = true;
  this.api.approve(r.id).subscribe({
    next:()=>{ this.toast(true,'Aprobada y credenciales enviadas'); this.load(); this.busy=false; },
    error:()=>{ this.toast(false,'No se pudo aprobar'); this.busy=false; }
  });
}
  reject(r: AccessRequest){ const reason = prompt('Motivo de rechazo:') ?? 'No aprobado'; this.busy=true;
    this.api.reject(r.id, reason, true).subscribe({
      next:()=>{ this.toast(true,'Rechazada y notificada'); this.load(); this.busy=false; },
      error:()=>{ this.toast(false,'No se pudo rechazar'); this.busy=false; }
    });
  }
  private toast(ok:boolean,msg:string){ this.ok=ok; this.msg=msg; setTimeout(()=>this.msg='',4000); }
}
