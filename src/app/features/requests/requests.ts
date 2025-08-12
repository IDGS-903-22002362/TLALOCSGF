// src/app/features/requests/requests.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccessRequestsService, AccessRequest } from '../../core/services/access-requests';

@Component({
  standalone: true,
  selector: 'app-requests',
  imports: [CommonModule, FormsModule],
  template: `
  <section class="bg-emerald-50/60 min-h-[70vh]">
    <div class="mx-auto max-w-5xl px-6 py-10">
      <!-- Header + filtro -->
      <div class="mb-6 flex items-center justify-between gap-3">
        <h1 class="text-3xl font-extrabold text-gray-900">Solicitudes de acceso</h1>

        <select
          class="rounded-xl border border-gray-300 bg-white/90 px-3 py-2 text-gray-800 shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          [(ngModel)]="status" (change)="load()">
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      <!-- Tabla -->
      <div class="overflow-hidden rounded-2xl border bg-white/80 backdrop-blur shadow ring-1 ring-black/5">
        <table class="w-full table-auto text-sm text-gray-800">
          <thead class="bg-gray-50/80 text-gray-600">
            <tr>
              <th class="p-3 text-left font-semibold">Correo</th>
              <th class="p-3 text-left font-semibold">Nombre</th>
              <th class="p-3 text-center font-semibold">Creada</th>
              <th class="p-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of items" class="border-t hover:bg-gray-50/60">
              <td class="p-3">{{ r.email }}</td>
              <td class="p-3">{{ r.fullName || '-' }}</td>
              <td class="p-3 text-center">{{ r.createdAt | date:'short' }}</td>
              <td class="p-3 text-right">
                <ng-container *ngIf="status==='Pending'; else badge">
                  <button
                    class="mr-2 inline-flex items-center justify-center rounded-xl bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition
                           hover:scale-[1.01] hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                    (click)="openDialog('approve', r)" [disabled]="busy">
                    Aprobar
                  </button>
                  <button
                    class="inline-flex items-center justify-center rounded-xl bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition
                           hover:scale-[1.01] hover:bg-red-500 active:scale-95 disabled:opacity-50"
                    (click)="openDialog('reject', r)" [disabled]="busy">
                    Rechazar
                  </button>
                </ng-container>

                <!-- Badge cuando no es Pending -->
                <ng-template #badge>
                  <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        [ngClass]="{
                          'border-emerald-200 bg-emerald-50 text-emerald-700': status==='Approved',
                          'border-red-200 bg-red-50 text-red-700': status==='Rejected'
                        }">
                    {{ status }}
                  </span>
                </ng-template>
              </td>
            </tr>

            <tr *ngIf="items.length===0">
              <td colspan="4" class="p-6 text-center text-gray-600">Sin solicitudes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Toast -->
      <div *ngIf="msg"
           class="mt-4 rounded-xl border px-3 py-2 text-sm"
           [ngClass]="ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'">
        {{ msg }}
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div *ngIf="dialogOpen" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div class="w-full max-w-lg rounded-2xl border bg-white/90 backdrop-blur p-5 shadow-xl ring-1 ring-black/10">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">
          {{ action==='approve' ? 'Aprobar solicitud' : 'Rechazar solicitud' }}
        </h3>
        <p class="text-sm text-gray-600 mb-4" *ngIf="action==='approve'">
          Se crear&aacute; la cuenta y se enviar&aacute;n credenciales al correo <b>{{ current?.email }}</b>.
        </p>

        <div *ngIf="action==='reject'" class="space-y-2 mb-4">
          <label class="text-sm text-gray-700">Motivo de rechazo</label>
          <textarea
            [(ngModel)]="reason" rows="3"
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Escribe un motivo breve..."></textarea>
          <p class="text-xs text-gray-500">Se notificar&aacute; al solicitante por correo.</p>
        </div>

        <div class="mt-3 flex items-center justify-end gap-2">
          <button class="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50" (click)="closeDialog()" [disabled]="busy">Cancelar</button>
          <button
            class="rounded-xl px-4 py-2 font-semibold text-white shadow-sm transition
                   hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            [ngClass]="action==='approve' ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-red-600 hover:bg-red-500'"
            (click)="confirm()" [disabled]="busy || (action==='reject' && !reason.trim())">
            {{ busy ? 'Procesando…' : (action==='approve' ? 'Aprobar' : 'Rechazar') }}
          </button>
        </div>
      </div>
    </div>
  </section>
  `
})
export class RequestsComponent {
  items: AccessRequest[] = [];
  status: 'Pending'|'Approved'|'Rejected' = 'Pending';

  // UI
  msg = ''; ok = false; busy = false;

  // Modal state
  dialogOpen = false;
  action: 'approve'|'reject'|null = null;
  current: AccessRequest | null = null;
  reason = '';

  constructor(private api: AccessRequestsService) { this.load(); }

  load(){ this.api.list(this.status).subscribe({ next: r => this.items = r }); }

  openDialog(action: 'approve'|'reject', r: AccessRequest){
    this.action = action;
    this.current = r;
    this.reason = '';
    this.dialogOpen = true;
  }
  closeDialog(){ if(!this.busy){ this.dialogOpen = false; this.action = null; this.current = null; this.reason = ''; } }

  confirm(){
    if(!this.current || !this.action) return;
    this.busy = true;

    if(this.action === 'approve'){
      this.api.approve(this.current.id).subscribe({
        next:()=>{ this.toast(true,'Aprobada y credenciales enviadas'); this.postAction(); },
        error:()=>{ this.toast(false,'No se pudo aprobar'); this.postAction(false); }
      });
    } else {
      const reason = this.reason.trim() || 'No aprobado';
      this.api.reject(this.current.id, reason, true).subscribe({
        next:()=>{ this.toast(true,'Rechazada y notificada'); this.postAction(); },
        error:()=>{ this.toast(false,'No se pudo rechazar'); this.postAction(false); }
      });
    }
  }

  private postAction(ok=true){
    this.busy = false;
    this.closeDialog();
    if(ok) this.load();
  }

  private toast(ok:boolean,msg:string){ this.ok=ok; this.msg=msg; setTimeout(()=>this.msg='',4000); }
}
