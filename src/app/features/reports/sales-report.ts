import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReportsService, SalesResponse } from '../../core/services/reports';
import { RouterLink, RouterLinkActive } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-sales-report',
  imports: [CommonModule, FormsModule, NgxEchartsModule, RouterLink, RouterLinkActive],
  template: `
  <section class="bg-emerald-50/60 min-h-[80vh]">
  <div class="mx-auto max-w-6xl px-6 py-8 space-y-5">
    <h1 class="text-3xl font-extrabold text-gray-900">Ventas por día</h1>
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

    <!-- Filtros (corregido para que no se salgan los botones) -->
    <div class="rounded-2xl border bg-white/80 backdrop-blur p-4 shadow ring-1 ring-black/5 overflow-hidden">
      <div class="grid items-end gap-3 md:grid-cols-12">
        <!-- Desde -->
        <div class="col-span-12 md:col-span-3">
          <label class="mb-1 block text-sm text-gray-600">Desde</label>
          <input
            type="date"
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-800
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            [(ngModel)]="fromStr"
          />
        </div>

        <!-- Hasta -->
        <div class="col-span-12 md:col-span-3">
          <label class="mb-1 block text-sm text-gray-600">Hasta</label>
          <input
            type="date"
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-800
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            [(ngModel)]="toStr"
          />
        </div>

        <!-- CustomerId -->
        <div class="col-span-12 md:col-span-3">
          <label class="mb-1 block text-sm text-gray-600">CustomerId</label>
          <input
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-800
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            [(ngModel)]="customerId"
            placeholder="Opcional"
          />
        </div>

        <!-- ProductId -->
        <div class="col-span-12 md:col-span-2">
          <label class="mb-1 block text-sm text-gray-600">ProductId</label>
          <input
            type="number"
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-800
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            [(ngModel)]="productIdInput"
            placeholder="Opcional"
          />
        </div>

        <!-- Ajuste zona -->
        <div class="col-span-12 md:col-span-1">
          <label class="mb-1 block text-sm text-transparent select-none">.</label>
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              [(ngModel)]="useLocalTz"
            />
            Ajustar a zona local
          </label>
        </div>

        <!-- Acciones -->
        <div class="col-span-12 flex flex-wrap items-center justify-end gap-2">
          <button
            class="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white shadow
                   hover:scale-[1.01] hover:bg-emerald-600 active:scale-95"
            (click)="load()"
          >
            Aplicar
          </button>

          <button
            class="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50"
            (click)="reset()"
          >
            Reset
          </button>

          <button
            class="rounded-xl border px-3 py-2 text-gray-700 hover:bg-gray-50"
            (click)="download('csv')"
          >
            CSV
          </button>

          <button
            class="rounded-xl border px-3 py-2 text-gray-700 hover:bg-gray-50"
            (click)="download('pdf')"
          >
            PDF
          </button>
        </div>
      </div>
    </div>

    <!-- KPIs -->
    <div *ngIf="header(); else kpisSkeleton" class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border bg-white/90 p-4 shadow-sm ring-1 ring-black/5">
        <div class="text-xs text-gray-500">Órdenes</div>
        <div class="mt-1 text-2xl font-semibold text-gray-900">{{ header()?.orders }}</div>
      </div>
      <div class="rounded-2xl border bg-white/90 p-4 shadow-sm ring-1 ring-black/5">
        <div class="text-xs text-gray-500">Unidades</div>
        <div class="mt-1 text-2xl font-semibold text-gray-900">{{ header()?.units }}</div>
      </div>
      <div class="rounded-2xl border bg-white/90 p-4 shadow-sm ring-1 ring-black/5">
        <div class="text-xs text-gray-500">Total</div>
        <div class="mt-1 text-2xl font-semibold text-emerald-700">{{ header()?.total | currency }}</div>
      </div>
    </div>
    <ng-template #kpisSkeleton>
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="h-20 animate-pulse rounded-2xl bg-gray-200/60"></div>
        <div class="h-20 animate-pulse rounded-2xl bg-gray-200/60"></div>
        <div class="h-20 animate-pulse rounded-2xl bg-gray-200/60"></div>
      </div>
    </ng-template>

    <!-- Gráfica -->
    <div class="rounded-2xl border bg-white/90 p-4 shadow ring-1 ring-black/5">
      <div echarts [options]="chartOpt" class="w-full" style="height: 380px;"></div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto rounded-2xl border bg-white/90 shadow ring-1 ring-black/5">
      <table class="min-w-full text-sm text-gray-800">
        <thead class="bg-gray-50/80 text-gray-600">
          <tr>
            <th class="p-3 text-left font-semibold">Fecha</th>
            <th class="p-3 text-right font-semibold">Órdenes</th>
            <th class="p-3 text-right font-semibold">Unidades</th>
            <th class="p-3 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows()" class="border-t hover:bg-gray-50/50">
            <td class="p-3">{{ r.date | date:'yyyy-MM-dd' }}</td>
            <td class="p-3 text-right">{{ r.orders }}</td>
            <td class="p-3 text-right">{{ r.units }}</td>
            <td class="p-3 text-right">{{ r.total | currency }}</td>
          </tr>
          <tr *ngIf="!rows().length">
            <td colspan="4" class="p-6 text-center text-gray-600">Sin datos</td>
          </tr>
        </tbody>
      </table>
    </div>
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
  productIdInput = '';

  header = signal<SalesResponse['header'] | null>(null);
  rows   = signal<SalesResponse['rows']>([]);
  chartOpt: any = {};

  ngOnInit() { this.load(); }

  reset() {
    this.fromStr = this.toISODate(new Date(Date.now() - 29 * 86400000));
    this.toStr   = this.toISODate(new Date());
    this.customerId = '';
    this.productIdInput = '';
    this.useLocalTz = true;
    this.load();
  }

  load() {
    const from = this.fromStr ? new Date(this.fromStr) : undefined;
    const to   = this.toStr   ? new Date(this.toStr)   : undefined;
    const tzOffset = this.useLocalTz ? -new Date().getTimezoneOffset() : undefined;
    const productId = this.productIdInput ? Number(this.productIdInput) : undefined;

    this.api.getSales({ from, to, tzOffset, customerId: this.customerId || undefined, productId })
      .subscribe(res => {
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

    this.api.exportSales(fmt, { from, to, tzOffset, customerId: this.customerId || undefined, productId })
      .subscribe(res => {
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

    // colores consistentes con la marca
    const emerald = '#059669';
    const emeraldLight = '#A7F3D0';
    const gray600 = '#4B5563';

    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Total', 'Órdenes'] },
      dataZoom: [
        { type: 'inside' },
        { type: 'slider', height: 22, bottom: 8 }
      ], /* dataZoom recomendado para explorar series largas */ /* :contentReference[oaicite:1]{index=1} */
      grid: { left: 48, right: 40, top: 36, bottom: 60 },

      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#E5E7EB' } },
        axisLabel: { color: gray600 }
      },

      yAxis: [
        { type: 'value', name: 'Total', axisLabel: { color: gray600 }, splitLine: { lineStyle: { color: '#F3F4F6' } } },
        { type: 'value', name: 'Órdenes', axisLabel: { color: gray600 }, splitLine: { show: false } }
      ], /* doble eje para magnitudes distintas, soportado por ECharts */ /* :contentReference[oaicite:2]{index=2} */

      series: [
        {
          name: 'Total',
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: emerald },
          lineStyle: { width: 3, color: emerald },
          areaStyle: {
            // degradado del área bajo la línea
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(5,150,105,0.28)' },
                { offset: 1, color: 'rgba(5,150,105,0.03)' }
              ]
            }
          }, /* areaStyle para líneas de área */ /* :contentReference[oaicite:3]{index=3} */
          data: totals
        },
        {
          name: 'Órdenes',
          type: 'bar',
          yAxisIndex: 1,
          data: orders,
          barWidth: '48%',
          itemStyle: { color: emeraldLight, borderRadius: [6, 6, 0, 0] }
        }
      ]
    };
  }

  private toISODate(d: Date) {
    // fecha “plana” para <input type="date">
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);
  }
}
