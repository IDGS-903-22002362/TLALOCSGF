import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReportsService, MarginRow } from '../../core/services/reports';

@Component({
  standalone: true,
  selector: 'app-margins-report',
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  template: `
  <section class="max-w-6xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold">Márgenes por producto</h1>

    <!-- Filtros -->
    <div class="bg-white border rounded p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label class="text-sm text-gray-600 block mb-1">Desde</label>
        <input type="date" class="border rounded px-3 py-2" [(ngModel)]="fromStr">
      </div>
      <div>
        <label class="text-sm text-gray-600 block mb-1">Hasta</label>
        <input type="date" class="border rounded px-3 py-2" [(ngModel)]="toStr">
      </div>
      <div>
        <label class="text-sm text-gray-600 block mb-1">ProductId</label>
        <input type="number" class="border rounded px-3 py-2 w-40" [(ngModel)]="productIdInput" placeholder="Opcional">
      </div>
      <div>
        <label class="text-sm text-gray-600 block mb-1">Top N</label>
        <input type="number" class="border rounded px-3 py-2 w-28" [(ngModel)]="topN" (change)="load()">
      </div>

      <button class="bg-green-600 text-white px-4 py-2 rounded" (click)="load()">Aplicar</button>

      <div class="ml-auto flex gap-2">
        <button class="px-3 py-2 border rounded" (click)="download('csv')">CSV</button>
        <button class="px-3 py-2 border rounded" (click)="download('pdf')">PDF</button>
      </div>
    </div>

    <!-- Gráfica -->
    <div class="bg-white border rounded p-4">
      <div echarts [options]="chartOpt" class="w-full" style="height: 360px;"></div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto border rounded">
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
            <td class="p-2 text-right">{{ r.margin | number:'1.0-2' }}</td>
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

  // filtros (últimos 30 días)
  fromStr = this.toISODate(new Date(Date.now() - 29 * 86400000));
  toStr   = this.toISODate(new Date());
  productIdInput = ''; // string para ngModel cómodo
  topN = 15;

  rows = signal<MarginRow[]>([]);
  chartOpt: any = {};

  ngOnInit() { this.load(); }

  load() {
    const from = this.fromStr ? new Date(this.fromStr) : undefined;
    const to   = this.toStr   ? new Date(this.toStr)   : undefined;
    const productId = this.productIdInput ? Number(this.productIdInput) : undefined;

    this.api.getMargins({ from, to, productId }).subscribe(r => {
      const data = [...r.rows];

      // si hay productId, mostramos ese único; si no, Top N por margen
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
    const values = rows.map(x => x.margin);

    return {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { interval: 0, rotate: labels.length > 8 ? 30 : 0 }
      },
      yAxis: { type: 'value', name: 'Margen %' },
      series: [{ type: 'bar', data: values }],
      grid: { left: 50, right: 20, bottom: 80, top: 20 }
    };
  }

  private toISODate(d: Date) {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);
  }
}
