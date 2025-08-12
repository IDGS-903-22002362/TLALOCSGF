// src/app/features/support/ticket-detail.component.ts
import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
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
  <section class="bg-emerald-50/60 min-h-[80vh]" *ngIf="ticket() as t">
    <div class="mx-auto max-w-5xl px-6 py-10">

      <!-- Header -->
      <div class="mb-6 flex items-center justify-between gap-3">
        <a routerLink="/support/tickets"
           class="inline-flex items-center gap-2 text-emerald-700 hover:underline">
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/></svg>
          Volver
        </a>

        <h1 class="text-3xl font-extrabold text-gray-900">Ticket #{{ t.id }}</h1>

        <button *ngIf="isAdmin"
          class="rounded-xl border border-emerald-600 px-4 py-2 font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-95"
          (click)="publishFaq()">
          Publicar como FAQ
        </button>
      </div>

      <!-- Meta -->
      <div class="mb-6 rounded-2xl border bg-white/80 backdrop-blur p-5 shadow ring-1 ring-black/5">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div class="text-sm text-gray-500">Asunto</div>
            <div class="font-medium text-gray-900">{{ t.subject }}</div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Estado</div>
            <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                  [ngClass]="{
                    'border-amber-200 bg-amber-50 text-amber-700': t.status==='Open',
                    'border-sky-200 bg-sky-50 text-sky-700': t.status==='In Progress',
                    'border-emerald-200 bg-emerald-50 text-emerald-700': t.status==='Closed'
                  }">
              {{ t.status }}
            </span>
          </div>

          <div>
            <div class="text-sm text-gray-500">Creado</div>
            <div class="text-gray-800">{{ t.createdAt | date:'short' }}</div>
          </div>

          <div>
            <div class="text-sm text-gray-500">Cerrado</div>
            <div class="text-gray-800">{{ t.closedAt ? (t.closedAt | date:'short') : '-' }}</div>
          </div>
        </div>
      </div>

      <!-- Conversación -->
      <div class="rounded-2xl border bg-white/80 backdrop-blur p-5 shadow ring-1 ring-black/5">
        <h2 class="mb-4 text-lg font-semibold text-gray-800">Mensajes</h2>

        <div #scrollArea class="max-h-[420px] overflow-auto pr-2 space-y-4">
          <ng-container *ngIf="messages().length; else empty">
            <div *ngFor="let m of messages()"
                 class="max-w-[85%]"
                 [ngClass]="{ 'ml-auto': m.senderId === meId }">
              <div class="mb-1 text-xs text-gray-500"
                   [ngClass]="{ 'text-right': m.senderId === meId }">
                <b>{{ m.senderName || (m.senderId === meId ? 'Tú' : m.senderId) }}</b>
                — {{ m.createdAt | date:'short' }}
              </div>

              <div class="rounded-2xl border px-4 py-2 shadow-sm whitespace-pre-line"
                   [ngClass]="m.senderId === meId
                     ? 'bg-emerald-600 text-white border-emerald-600'
                     : 'bg-white text-gray-800 border-gray-200'">
                {{ m.body }}
              </div>
            </div>
          </ng-container>

          <ng-template #empty>
            <div class="text-gray-500">Sin mensajes aún.</div>
          </ng-template>
        </div>

        <!-- Composer -->
        <form [formGroup]="form" (ngSubmit)="send()" class="mt-4">
          <textarea rows="3"
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Escribe un mensaje..."
            formControlName="body"
            [disabled]="t.status==='Closed' || sending()"></textarea>

          <div class="mt-2 flex items-center gap-3">
            <button
              class="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white shadow-md transition
                     hover:scale-[1.01] hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
              [disabled]="form.invalid || t.status==='Closed' || sending()">
              {{ sending() ? 'Enviando…' : 'Enviar' }}
            </button>

            <span *ngIf="t.status==='Closed'" class="text-sm text-gray-500">
              El ticket está cerrado.
            </span>
          </div>
        </form>
      </div>

    </div>
  </section>
  `
})
export class TicketDetailComponent {
  private route = inject(ActivatedRoute);
  private api   = inject(SupportService);
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);

  @ViewChild('scrollArea') scrollArea?: ElementRef<HTMLDivElement>;

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
    this.api.getMessages(id).subscribe({
      next: msgs => { this.messages.set(msgs); this.scrollToBottom(); }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollArea?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
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
        this.scrollToBottom();
        // refresca status del ticket (podría pasar a "In Progress")
        this.api.getTicket(id).subscribe({ next: t => this.ticket.set(t) });
      },
      error: _ => this.sending.set(false)
    });
  }

  publishFaq() {
    const t = this.ticket();
    if (!t) return;
    this.api.publishTicketAsFaq(t.id).subscribe({
      next: _ => alert('Publicado como FAQ. Revisa /support/faqs'),
      error: e => alert('No se pudo publicar: ' + (e?.error ?? 'Error'))
    });
  }
}
