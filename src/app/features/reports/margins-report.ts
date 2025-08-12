// src/app/features/reports/margins-report.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReportsService, MarginRow } from '../../core/services/reports';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-margins-report',
  imports: [CommonModule, FormsModule, NgxEchartsModule, RouterLink, RouterLinkActive],
  template: `
  <section class="max-w-6xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold">Márgenes por producto</h1>
      <!-- ▸ SUBNAV REPORTES (pegar debajo del <h1>) -->
<nav class="mt-1 mb-4">
  <ul class="flex flex-wrap gap-2">
    <li>
      <a
        routerLink="/reports/sales"
        [routerLinkActiveOptions]="{ exact: true }"
        routerLinkActive="bg-emerald-700 text-white border-emerald-700 shadow"
        class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium
               text-gray-700 hover:bg-emerald-50 transition">
        Ventas
      </a>
    </li>

    <li>
      <a
        routerLink="/reports/rotation"
        [routerLinkActiveOptions]="{ exact: true }"
        routerLinkActive="bg-emerald-700 text-white border-emerald-700 shadow"
        class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium
               text-gray-700 hover:bg-emerald-50 transition">
        Rotación
      </a>
    </li>

    <li>
      <a
        routerLink="/reports/margins"
        [routerLinkActiveOptions]="{ exact: true }"
        routerLinkActive="bg-emerald-700 text-white border-emerald-700 shadow"
        class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium
               text-gray-700 hover:bg-emerald-50 transition">
        Márgenes
      </a>
    </li>
  </ul>
</nav>

    <!-- Filtros -->
    <div
      class="bg-white border rounded-2xl p-4 flex flex-wrap gap-3 items-end shadow-sm">
      <div>
        <label class="text-sm text-gray-600 block mb-1">Desde</label>
        <input type="date" class="border rounded-xl px-3 py-2"
               [(ngModel)]="fromStr">
      </div>

      <div>
        <label class="text-sm text-gray-600 block mb-1">Hasta</label>
        <input type="date" class="border rounded-xl px-3 py-2"
               [(ngModel)]="toStr">
      </div>

      <div>
        <label class="text-sm text-gray-600 block mb-1">ProductId</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-40"
               [(ngModel)]="productIdInput" placeholder="Opcional">
      </div>

      <div>
        <label class="text-sm text-gray-600 block mb-1">Top N</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-28"
               [(ngModel)]="topN" (change)="load()">
      </div>

      <button class="rounded-xl bg-emerald-700 text-white px-4 py-2
                     shadow-sm hover:bg-emerald-600"
              (click)="load()">
        Aplicar
      </button>
      <button class="rounded-xl border px-4 py-2"
              (click)="reset()">Reset</button>

      <div class="ml-auto flex gap-2">
        <button class="px-3 py-2 border rounded-xl" (click)="download('csv')">
          CSV
        </button>
        <button class="px-3 py-2 border rounded-xl" (click)="download('pdf')">
          PDF
        </button>
      </div>
    </div>

    <!-- Gráfica -->
    <div class="bg-white border rounded-2xl p-4 shadow-sm">
      <div echarts [options]="chartOpt" class="w-full" style="height: 380px;"></div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto border rounded-2xl shadow-sm">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-2 text-left">Producto</th>
            <th class="p-2 text-right">Costo base</th>
            <th class="p-2 text-right">Precio medio</th>
            <th class="p-2 text-right">Margen %</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows()" class="border-t">
            <td class="p-2">{{ r.name }}</td>
            <td class="p-2 text-right">{{ r.basePrice | currency }}</td>
            <td class="p-2 text-right">{{ r.avgSalePrice | currency }}</td>
            <!-- El backend devuelve margen como 0..1: mostramos en % -->
            <td class="p-2 text-right">{{ (r.margin * 100) | number:'1.0-2' }}</td>
          </tr>
          <tr *ngIf="!rows().length">
            <td colspan="4" class="p-4 text-center text-gray-500">Sin datos</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  `
})
export class MarginsReportComponent {
  private api = inject(ReportsService);

  // Filtros (últimos 30 días)
  fromStr = this.toISODate(new Date(Date.now() - 29 * 86400000));
  toStr   = this.toISODate(new Date());
  productIdInput = ''; // string para ngModel cómodo
  topN = 15;

  rows = signal<MarginRow[]>([]);
  chartOpt: any = {};

  ngOnInit() {
    this.load();
  }

  reset() {
    this.fromStr = this.toISODate(new Date(Date.now() - 29 * 86400000));
    this.toStr   = this.toISODate(new Date());
    this.productIdInput = '';
    this.topN = 15;
    this.load();
  }

  load() {
    const from = this.fromStr ? new Date(this.fromStr) : undefined;
    const to   = this.toStr   ? new Date(this.toStr)   : undefined;
    const productId = this.productIdInput ? Number(this.productIdInput) : undefined;

    this.api.getMargins({ from, to, productId }).subscribe(r => {
      const data = [...r.rows];

      // Si se indica productId, mostramos lo que venga; si no, Top N por mayor margen
      const sliced = productId
        ? data
        : data.sort((a, b) => b.margin - a.margin).slice(0, Math.max(1, this.topN));

      this.rows.set(sliced);
      this.chartOpt = this.buildChart(sliced);
    });
  }

  download(fmt: 'csv' | 'pdf') {
    const from = this.fromStr ? new Date(this.fromStr) : undefined;
    const to   = this.toStr   ? new Date(this.toStr)   : undefined;
    const productId = this.productIdInput ? Number(this.productIdInput) : undefined;

    this.api.exportMargins(fmt as any, { from, to, productId }).subscribe(res => {
      const blob = res.body as Blob;
      const cd = res.headers.get('Content-Disposition') || '';
      const match = /filename="?([^"]+)"?/i.exec(cd);
      const filename = match?.[1] ?? `margins.${fmt}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    });
  }

  private buildChart(rows: MarginRow[]) {
    const labels = rows.map(x => x.name);
    const values = rows.map(x => x.margin); // 0..1

    // Paleta: rojo (bajo margen) → verde (alto margen)
    const colorByValue = (v: number) => {
      // Hue 0 (rojo) a 120 (verde)
      const h = Math.max(0, Math.min(120, Math.round(v * 120)));
      return `hsl(${h} 65% 45%)`;
    };

    return {
      tooltip: {
        trigger: 'axis',
        // Mostramos el margen formateado en % (usando formatter del tooltip)
        formatter: (p: any) => {
          const item = Array.isArray(p) ? p[0] : p;
          const val = Array.isArray(p) ? p[0].data : p.data;
          return `${item.axisValue}<br/>Margen: ${(val * 100).toFixed(1)}%`;
        }
      },
      grid: { left: 48, right: 16, bottom: labels.length > 10 ? 90 : 60, top: 20 },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { interval: 0, rotate: labels.length > 10 ? 30 : 0 }
      },
      yAxis: {
        type: 'value',
        name: 'Margen %',
        // Formateamos el eje en porcentaje sin cambiar los datos originales
        axisLabel: {
          formatter: (v: number) => `${(v * 100).toFixed(0)}%`
        }
      },
      dataZoom: labels.length > 14
        ? [{ type: 'inside' }, { type: 'slider', height: 16, bottom: 8 }]
        : undefined,
      series: [{
        name: 'Margen',
        type: 'bar',
        data: values,
        // Color por valor (callback en itemStyle.color)
        itemStyle: {
          color: (p: any) => colorByValue(p.data as number)
        },
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.2)' } }
      }]
    };
  }

  private toISODate(d: Date) {
    // “Aplana” a yyyy-MM-dd para <input type="date">
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);
  }
}
