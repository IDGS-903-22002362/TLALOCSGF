import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupportService, TicketDto, TicketMessageDto } from '../../core/services/support';
import { AuthService } from '../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-ticket-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="max-w-4xl mx-auto p-6" *ngIf="ticket()">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold">Ticket #{{ ticket()?.id }}</h1>

    <div class="flex items-center gap-3">
      <!-- 👇 Solo Admin ve este botón -->
      <button
        *ngIf="isAdmin"
        class="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        (click)="publishFaq()">
        Publicar como FAQ
      </button>

      <a routerLink="/support/tickets" class="text-green-700 hover:underline text-sm">← Volver</a>
    </div>
  </div>

  <div class="bg-white rounded border p-4 mb-4">
    <div class="grid md:grid-cols-2 gap-3">
      <div>
        <div class="text-sm text-gray-500">Asunto</div>
        <div class="font-medium">{{ ticket()?.subject }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Estado</div>
        <span class="px-2 py-0.5 rounded inline-block"
              [class.bg-yellow-100]="ticket()?.status==='Open'"
              [class.bg-blue-100]="ticket()?.status==='In Progress'"
              [class.bg-green-100]="ticket()?.status==='Closed'">
          {{ ticket()?.status }}
        </span>
      </div>
      <div>
        <div class="text-sm text-gray-500">Creado</div>
        <div>{{ ticket()?.createdAt | date:'short' }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Cerrado</div>
        <div>{{ ticket()?.closedAt ? (ticket()?.closedAt | date:'short') : '-' }}</div>
      </div>
    </div>
  </div>

  <div class="bg-white rounded border p-4 mb-4">
    <h2 class="font-semibold mb-3">Mensajes</h2>
    <div class="space-y-3 max-h-[420px] overflow-auto pr-1">
      <div *ngFor="let m of messages()" class="border rounded p-3"
           [class.bg-gray-50]="m.senderId === meId">
        <div class="text-xs text-gray-500 mb-1">
          <b>{{ m.senderName || (m.senderId === meId ? 'Tú' : m.senderId) }}</b> —
          {{ m.createdAt | date:'short' }}
        </div>
        <div class="whitespace-pre-line">{{ m.body }}</div>
      </div>
      <div *ngIf="messages().length === 0" class="text-gray-500">Sin mensajes aún.</div>
    </div>

    <form [formGroup]="form" (ngSubmit)="send()" class="mt-4">
      <textarea class="w-full border rounded px-3 py-2" rows="3"
                placeholder="Escribe un mensaje..."
                formControlName="body"
                [disabled]="ticket()?.status==='Closed' || sending()"></textarea>
      <div class="mt-2">
        <button class="bg-green-600 text-white rounded px-4 py-2"
                [disabled]="form.invalid || ticket()?.status==='Closed' || sending()">
          {{ sending() ? 'Enviando…' : 'Enviar' }}
        </button>
        <span *ngIf="ticket()?.status==='Closed'" class="ml-3 text-sm text-gray-500">
          El ticket está cerrado.
        </span>
      </div>
    </form>
  </div>
</section>
  `
})
export class TicketDetailComponent {
  private route = inject(ActivatedRoute);
  private api   = inject(SupportService);
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);

  // 👇 ahora existe
  isAdmin = this.auth.roles.some(r => r.toLowerCase() === 'admin');

  ticket   = signal<TicketDto | null>(null);
  messages = signal<TicketMessageDto[]>([]);
  sending  = signal(false);

  // nameid = ClaimTypes.NameIdentifier
  meId = this.auth.isLoggedIn()
    ? (this.auth as any).jwt.decodeToken(localStorage.getItem('token')!)?.['nameid'] ?? ''
    : '';

  form = this.fb.nonNullable.group({
    body: ['', Validators.required]
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  private load(id: number) {
    this.api.getTicket(id).subscribe({ next: t => this.ticket.set(t) });
    this.api.getMessages(id).subscribe({ next: msgs => this.messages.set(msgs) });
  }

  send() {
    if (this.form.invalid || !this.ticket()) return;
    const id = this.ticket()!.id;
    const body = this.form.getRawValue().body.trim();
    if (!body) return;

    this.sending.set(true);
    this.api.postMessage(id, body).subscribe({
      next: m => {
        this.messages.update(arr => [...arr, m]);
        this.form.reset();
        this.sending.set(false);
        // puede cambiar a "In Progress" si respondió un admin
        this.api.getTicket(id).subscribe({ next: t => this.ticket.set(t) });
      },
      error: _ => this.sending.set(false)
    });
  }

  // 👇 botón "Publicar como FAQ"
  publishFaq() {
    const t = this.ticket();
    if (!t) return;
    this.api.publishTicketAsFaq(t.id).subscribe({
      next: _ => alert('Publicado como FAQ. Revisa /support/faqs'),
      error: e => alert('No se pudo publicar: ' + (e?.error ?? 'Error'))
    });
  }
}