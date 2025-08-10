import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReportsService, SalesResponse } from '../../core/services/reports';

@Component({
  standalone: true,
  selector: 'app-sales-report',
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  template: `
  <section class="max-w-6xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold">Ventas por día</h1>

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
        <label class="text-sm text-gray-600 block mb-1">CustomerId</label>
        <input class="border rounded px-3 py-2 w-56" [(ngModel)]="customerId" placeholder="Opcional">
      </div>

      <div>
        <label class="text-sm text-gray-600 block mb-1">ProductId</label>
        <input type="number" class="border rounded px-3 py-2 w-40" [(ngModel)]="productIdInput" placeholder="Opcional">
      </div>

      <label class="inline-flex items-center gap-2 ml-1">
        <input type="checkbox" class="size-4" [(ngModel)]="useLocalTz">
        <span class="text-sm">Ajustar a zona local</span>
      </label>

      <button class="bg-green-600 text-white px-4 py-2 rounded" (click)="load()">Aplicar</button>

      <div class="ml-auto flex gap-2">
        <button class="px-3 py-2 border rounded" (click)="download('csv')">CSV</button>
        <button class="px-3 py-2 border rounded" (click)="download('pdf')">PDF</button>
      </div>
    </div>

    <!-- KPIs -->
    <div *ngIf="header()" class="bg-white border rounded p-4 grid sm:grid-cols-3 gap-4">
      <div>
        <div class="text-xs text-gray-500">Órdenes</div>
        <div class="text-xl font-semibold">{{ header()?.orders }}</div>
      </div>
      <div>
        <div class="text-xs text-gray-500">Unidades</div>
        <div class="text-xl font-semibold">{{ header()?.units }}</div>
      </div>
      <div>
        <div class="text-xs text-gray-500">Total</div>
        <div class="text-xl font-semibold">{{ header()?.total | currency }}</div>
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
            <th class="p-2 text-left">Fecha</th>
            <th class="p-2 text-right">Órdenes</th>
            <th class="p-2 text-right">Unidades</th>
            <th class="p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows()" class="border-t">
            <td class="p-2">{{ r.date | date:'yyyy-MM-dd' }}</td>
            <td class="p-2 text-right">{{ r.orders }}</td>
            <td class="p-2 text-right">{{ r.units }}</td>
            <td class="p-2 text-right">{{ r.total | currency }}</td>
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
export class SalesReportComponent {
  private api = inject(ReportsService);

  // Filtros por defecto (últimos 30 días)
  fromStr = this.toISODate(new Date(Date.now() - 29 * 86400000));
  toStr   = this.toISODate(new Date());
  useLocalTz = true;

  customerId = '';
  productIdInput = ''; // cadena para no pelear con ngModel/number

  header = signal<SalesResponse['header'] | null>(null);
  rows   = signal<SalesResponse['rows']>([]);
  chartOpt: any = {};

  ngOnInit() { this.load(); }

  load() {
    const from = this.fromStr ? new Date(this.fromStr) : undefined;
    const to   = this.toStr   ? new Date(this.toStr)   : undefined;
    const tzOffset = this.useLocalTz ? -new Date().getTimezoneOffset() : undefined;
    const productId = this.productIdInput ? Number(this.productIdInput) : undefined;

    this.api.getSales({
      from, to, tzOffset,
      customerId: this.customerId || undefined,
      productId
    }).subscribe(res => {
      this.header.set(res.header);
      this.rows.set(res.rows);
      this.chartOpt = this.buildChart(res.rows);
    });
  }

  download(fmt: 'csv'|'pdf') {
    const from = this.fromStr ? new Date(this.fromStr) : undefined;
    const to   = this.toStr   ? new Date(this.toStr)   : undefined;
    const tzOffset = this.useLocalTz ? -new Date().getTimezoneOffset() : undefined;
    const productId = this.productIdInput ? Number(this.productIdInput) : undefined;

    this.api.exportSales(fmt, {
      from, to, tzOffset,
      customerId: this.customerId || undefined,
      productId
    }).subscribe(res => {
      const blob = res.body as Blob;
      const cd = res.headers.get('Content-Disposition') || '';
      const match = /filename="?([^"]+)"?/i.exec(cd);
      const filename = match?.[1] ?? `sales.${fmt}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    });
  }

  private buildChart(rows: SalesResponse['rows']) {
    const dates  = rows.map(r => r.date.slice(0, 10));
    const totals = rows.map(r => r.total);
    const orders = rows.map(r => r.orders);

    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Total', 'Órdenes'] },
      dataZoom: [{ type: 'inside' }, { type: 'slider' }],
      xAxis: { type: 'category', data: dates, boundaryGap: false },
      yAxis: [
        { type: 'value', name: 'Total' },
        { type: 'value', name: 'Órdenes' }
      ],
      series: [
        { name: 'Total', type: 'line', smooth: true, yAxisIndex: 0, areaStyle: {}, data: totals },
        { name: 'Órdenes', type: 'bar', yAxisIndex: 1, data: orders, barWidth: '50%' }
      ],
      grid: { left: 50, right: 40, top: 40, bottom: 60 }
    };
  }

  private toISODate(d: Date) {
    // fecha “plana” para <input type="date">
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);
  }
}
