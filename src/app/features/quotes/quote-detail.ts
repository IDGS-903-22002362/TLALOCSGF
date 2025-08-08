import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { QuoteService } from '../../core/services/quotes';
import { QuoteDetailDto } from '../../models/quote';

@Component({
  standalone: true,
  selector: 'app-quote-detail',
  imports: [CommonModule],
  template: `
  <section class="p-6 max-w-3xl mx-auto" *ngIf="q">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Cotización #{{ q.id }}</h1>

      <button
        class="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        (click)="sendEmail()"
        [disabled]="sending"
        title="Enviar esta cotización al correo del usuario actual"
      >
        {{ sending ? 'Enviando…' : 'Enviar por correo' }}
      </button>
    </div>

    <table class="w-full mb-4 border">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2 text-left">Producto</th>
          <th class="p-2 text-right">Cant.</th>
          <th class="p-2 text-right">Precio</th>
          <th class="p-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let l of q.lines" class="border-t">
          <td class="p-2">{{ l.name }}</td>
          <td class="p-2 text-right">{{ l.quantity }}</td>
          <td class="p-2 text-right">{{ l.unitPrice | currency }}</td>
          <td class="p-2 text-right">{{ l.lineTotal | currency }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="font-semibold border-t">
          <td colspan="3" class="p-2 text-right">Total</td>
          <td class="p-2 text-right">{{ q.totalAmount | currency }}</td>
        </tr>
      </tfoot>
    </table>

    <div class="space-y-1">
      <p>Estado: <strong>{{ q.status }}</strong></p>
      <p *ngIf="q.validUntil">Válido hasta: {{ q.validUntil | date }}</p>
    </div>

    <!-- Mensajes -->
    <p *ngIf="msg" class="mt-4 text-sm" [class.text-green-600]="ok" [class.text-red-600]="!ok">
      {{ msg }}
    </p>
  </section>
  `,
})
export class QuoteDetailComponent {
  q!: QuoteDetailDto;

  sending = false;
  msg = '';
  ok  = false;

  constructor(
    private qs: QuoteService,
    private route: ActivatedRoute
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.qs.getQuote(id).subscribe({ next: d => (this.q = d) });
  }

  /** Envía la cotización al correo del usuario de la sesión */
  sendEmail(): void {
    if (!this.q) return;
    this.sending = true;
    this.msg = '';
    this.ok  = false;

    this.qs.emailQuote(this.q.id).subscribe({
      next: () => {
        this.ok = true;
        this.msg = 'Cotización enviada a tu correo. Si no te llega, revisa tu bandeja de spam.';
        this.sending = false;
      },
      error: () => {
        this.ok = false;
        this.msg = 'No se pudo enviar el correo. Inténtalo más tarde.';
        this.sending = false;
      }
    });
  }
}
