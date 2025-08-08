import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportService, FaqDto } from '../../core/services/support';

@Component({
  standalone: true,
  selector: 'app-faq-public',
  imports: [CommonModule],
  template: `
  <section class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Preguntas frecuentes</h1>

    <div *ngIf="faqs.length === 0" class="text-gray-500">No hay FAQs por ahora.</div>

    <div class="space-y-3">
      <details *ngFor="let f of faqs" class="bg-white rounded border">
        <summary class="cursor-pointer px-4 py-3 font-medium">{{ f.question }}</summary>
        <div class="px-4 py-3 text-gray-700 whitespace-pre-line">{{ f.answer }}</div>
      </details>
    </div>
  </section>
  `
})
export class FaqPublicComponent {
  faqs: FaqDto[] = [];
  constructor(private api: SupportService) { this.api.getFaqs().subscribe({ next: d => this.faqs = d }); }
}
