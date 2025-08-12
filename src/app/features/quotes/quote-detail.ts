import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

import { QuoteService } from '../../core/services/quotes';
import { QuoteDetailDto } from '../../models/quote';
import {
  QuoteOptionsDto,
  QuotePricePreviewDto,
  Fulfillment,
  StateOption,
} from '../../core/services/quotes';

@Component({
  standalone: true,
  selector: 'app-quote-detail',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quote-detail.html',
})
export class QuoteDetailComponent {
  private qs = inject(QuoteService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  id = Number(this.route.snapshot.paramMap.get('id'));

  q = signal<QuoteDetailDto | null>(null);
  states = signal<StateOption[]>([]);
  preview = signal<QuotePricePreviewDto | null>(null);
  loadingPreview = signal(false);
  saving = signal(false);
  msg = signal<string | null>(null);
  ok = signal<boolean>(true);

  // Formulario de opciones (valores legales: 'DevicesOnly' | 'Shipping' | 'Installation')
  form = this.fb.group({
    fulfillment: this.fb.control<Fulfillment>('DevicesOnly', { nonNullable: true }),
    stateCode: this.fb.control<string | null>(null),
    manualDistanceKm: this.fb.control<number | null>(null, { validators: [Validators.min(0)] }),
  });

  ngOnInit() {
    this.load();
    this.qs.getStates().subscribe((s) => this.states.set(s));

    // Actualizar preview cuando cambian las opciones
    this.form.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((v) => {
          this.msg.set(null);

          if (this.needsState(v) && !v.stateCode) {
            this.preview.set(null);
            return of(null);
          }

          this.loadingPreview.set(true);
          return this.qs.previewPrice(this.id, {
            fulfillment: v.fulfillment!,
            stateCode: v.stateCode ?? undefined,
            manualDistanceKm: v.manualDistanceKm ?? undefined,
          });
        })
      )
      .subscribe((res) => {
        this.loadingPreview.set(false);
        if (res) this.preview.set(res);
      });
  }

  /** ¿La opción seleccionada requiere estado? */
  needsState(v?: { fulfillment?: Fulfillment | null }): boolean {
    const f = (v?.fulfillment ?? this.form.get('fulfillment')!.value) as
      | 'DevicesOnly'
      | 'Shipping'
      | 'Installation';
    return f === 'Shipping' || f === 'Installation';
  }

  load() {
    this.qs.getQuote(this.id).subscribe((d) => {
      this.q.set(d);
      // Si el backend guardó opciones antes, podrías setearlas aquí:
      // this.form.patchValue({ fulfillment: d.fulfillment, stateCode: d.stateCode, manualDistanceKm: d.distanceKm });
    });
  }

  save() {
    if (this.needsState() && !this.form.value.stateCode) {
      this.msg.set('Selecciona el estado.');
      this.ok.set(false);
      return;
    }

    this.saving.set(true);
    this.qs.setOptions(this.id, this.toDto()).subscribe({
      next: (p) => {
        this.preview.set(p);
        this.msg.set('Opciones guardadas.');
        this.ok.set(true);
        this.saving.set(false);
        this.load();
      },
      error: () => {
        this.msg.set('No se pudieron guardar las opciones.');
        this.ok.set(false);
        this.saving.set(false);
      },
    });
  }

  sendEmail() {
    this.qs.emailQuote(this.id).subscribe({
      next: () => {
        this.msg.set('Cotización enviada por correo.');
        this.ok.set(true);
      },
      error: () => {
        this.msg.set('No se pudo enviar el correo.');
        this.ok.set(false);
      },
    });
  }

  private toDto(): QuoteOptionsDto {
    const v = this.form.getRawValue();
    return {
      fulfillment: v.fulfillment!,
      stateCode: v.stateCode ?? undefined,
      manualDistanceKm: v.manualDistanceKm ?? undefined,
    };
  }

  trackLine = (_: number, l: { name: string }) => l.name;
}
