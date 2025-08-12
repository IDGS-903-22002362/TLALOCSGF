import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReportsService, RotationResponse, RotationRow } from '../../core/services/reports';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-rotation-report',
  imports: [CommonModule, FormsModule, NgxEchartsModule, RouterLink, RouterLinkActive],
  template: `
  <section class="bg-emerald-50/60 min-h-[80vh]">
    <div class="mx-auto max-w-7xl px-6 py-8 space-y-5">
      <h1 class="text-3xl font-extrabold text-gray-900">Rotación de inventario</h1>
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
      <div class="rounded-2xl border bg-white/80 backdrop-blur p-4 shadow ring-1 ring-black/5 overflow-hidden">
        <div class="grid items-end gap-3 md:grid-cols-12">
          <!-- Días -->
          <div class="col-span-12 md:col-span-2">
            <label class="mb-1 block text-sm text-gray-600">Días</label>
            <input
              type="number"
              class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
              [(ngModel)]="days"
              (change)="goto(1)"
              min="1"
            />
          </div>

          <!-- Buscar -->
          <div class="col-span-12 md:col-span-6">
            <label class="mb-1 block text-sm text-gray-600">Buscar (nombre / SKU)</label>
            <input
              class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
              [(ngModel)]="q"
              (keyup.enter)="goto(1)"
              placeholder="Ej. filtro, BOM-123, etc."
            />
          </div>

          <!-- Página -->
          <div class="col-span-6 md:col-span-2">
            <label class="mb-1 block text-sm text-gray-600">Página</label>
            <div class="flex items-center gap-2">
              <button class="rounded-xl border px-3 py-2 text-gray-700 hover:bg-gray-50"
                      (click)="prev()" [disabled]="page<=1">‹</button>
              <div class="min-w-[3.5rem] text-center">{{ page }}</div>
              <button class="rounded-xl border px-3 py-2 text-gray-700 hover:bg-gray-50"
                      (click)="next()" [disabled]="page>=totalPages()">›</button>
            </div>
          </div>

          <!-- Tamaño -->
          <div class="col-span-6 md:col-span-2">
            <label class="mb-1 block text-sm text-gray-600">Tamaño</label>
            <select
              class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
              [(ngModel)]="pageSize" (change)="goto(1)">
              <option [ngValue]="20">20</option>
              <option [ngValue]="50">50</option>
              <option [ngValue]="100">100</option>
              <option [ngValue]="200">200</option>
            </select>
          </div>

          <!-- Acciones -->
          <div class="col-span-12 flex flex-wrap items-center justify-end gap-2">
            <button
              class="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white shadow
                     hover:scale-[1.01] hover:bg-emerald-600 active:scale-95"
              (click)="load()">
              Aplicar
            </button>
            <button class="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50"
                    (click)="reset()">Reset</button>
            <button class="rounded-xl border px-3 py-2 text-gray-700 hover:bg-gray-50"
                    (click)="download('csv')">CSV</button>
            <button class="rounded-xl border px-3 py-2 text-gray-700 hover:bg-gray-50"
                    (click)="download('pdf')">PDF</button>
          </div>
        </div>
      </div>

      <!-- Gráfica: Top 20 con menor cobertura -->
      <div class="rounded-2xl border bg-white/90 p-4 shadow ring-1 ring-black/5">
        <div class="mb-2 text-sm text-gray-600">
          Top 20 con menor <b>días de cobertura</b> (solo materiales con consumo &gt; 0).
        </div>
        <div echarts [options]="chartOpt" class="w-full" style="height: 440px;"></div>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto rounded-2xl border bg-white/90 shadow ring-1 ring-black/5">
        <table class="min-w-full text-sm text-gray-800">
          <thead class="bg-gray-50/80 text-gray-600">
            <tr>
              <th class="p-3 text-left font-semibold">Material</th>
              <th class="p-3 text-left font-semibold">SKU</th>
              <th class="p-3 text-right font-semibold">Stock</th>
              <th class="p-3 text-right font-semibold">Salida diaria</th>
              <th class="p-3 text-right font-semibold">Días de cobertura</th>
              <th class="p-3 text-center font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows()" class="border-t hover:bg-gray-50/50">
              <td class="p-3">{{ r.name }}</td>
              <td class="p-3">{{ r.sku || '-' }}</td>
              <td class="p-3 text-right">{{ r.stockQty }}</td>
              <td class="p-3 text-right">{{ r.avgDailyOut }}</td>
              <td class="p-3 text-right">
                {{ r.daysSupply === null ? 'N/A' : (r.daysSupply | number:'1.0-1') }}
              </td>
              <td class="p-3 text-center">
                <span class="px-2 py-0.5 rounded text-xs"
                      [class.bg-red-100]="state(r)==='Crítico'"
                      [class.text-red-700]="state(r)==='Crítico'"
                      [class.bg-amber-100]="state(r)==='Medio'"
                      [class.text-amber-700]="state(r)==='Medio'"
                      [class.bg-green-100]="state(r)==='OK'"
                      [class.text-green-700]="state(r)==='OK'">
                  {{ state(r) }}
                </span>
              </td>
            </tr>
            <tr *ngIf="rows().length===0">
              <td colspan="6" class="p-6 text-center text-gray-600">Sin resultados</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="mt-3 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Página {{ page }} de {{ totalPages() }} — {{ total() }} registros
        </div>
        <div class="flex gap-2">
          <button class="rounded-xl border px-3 py-1" (click)="prev()" [disabled]="page<=1">Anterior</button>
          <button class="rounded-xl border px-3 py-1" (click)="next()" [disabled]="page>=totalPages()">Siguiente</button>
        </div>
      </div>
    </div>
  </section>
  `
})
export class RotationReportComponent {
  private api = inject(ReportsService);

  // filtros
  days = 30;
  q = '';
  page = 1;
  pageSize = 50;

  // datos
  rows = signal<RotationRow[]>([]);
  total = signal(0);
  chartOpt: any = {};

  ngOnInit() { this.load(); }

  reset() {
    this.days = 30;
    this.q = '';
    this.page = 1;
    this.pageSize = 50;
    this.load();
  }

  load() {
    this.api.getRotation({
      days: this.days,
      page: this.page,
      pageSize: this.pageSize,
      q: this.q || undefined
    })
    .subscribe((res: RotationResponse) => {
      this.rows.set(res.rows);
      this.total.set(res.total);
      this.chartOpt = this.buildChart(res.rows);
    });
  }

  // Descargas
  download(fmt: 'csv'|'pdf') {
    this.api.exportRotation(fmt, {
      days: this.days,
      page: this.page,
      pageSize: this.pageSize,
      q: this.q || undefined
    }).subscribe(res => {
      const blob = res.body as Blob;
      const cd = res.headers.get('Content-Disposition') || '';
      const match = /filename="?([^"]+)"?/i.exec(cd);
      const filename = match?.[1] ?? `rotation.${fmt}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Helpers UI
  totalPages() { return Math.max(1, Math.ceil(this.total() / this.pageSize)); }
  prev(){ if (this.page > 1) { this.page--; this.load(); } }
  next(){ if (this.page < this.totalPages()) { this.page++; this.load(); } }
  goto(p:number){ this.page = Math.max(1, p); this.load(); }

  state(r: RotationRow): 'Crítico'|'Medio'|'OK'|'N/A' {
    if (r.daysSupply === null) return 'N/A';
    if (r.daysSupply < 5) return 'Crítico';
    if (r.daysSupply <= 15) return 'Medio';
    return 'OK';
  }

  // ECharts: barras horizontales con Top 20 menor cobertura (excluye N/A)
  private buildChart(rows: RotationRow[]) {
    const filtered = rows
      .filter(r => r.daysSupply !== null)
      .sort((a, b) => (a.daysSupply! - b.daysSupply!))
      .slice(0, 20);

    const categories = filtered.map(r => `${r.name}${r.sku ? ' (' + r.sku + ')' : ''}`);
    const values = filtered.map(r => r.daysSupply!);

    const colorFor = (v: number) => {
      if (v < 5)  return '#ef4444';   // rojo - crítico
      if (v <= 15) return '#f59e0b';  // ámbar - medio
      return '#10b981';               // verde - ok
    };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p: any) => {
          const it = Array.isArray(p) ? p[0] : p;
          return `${it.name}<br/><b>${it.value}</b> d`;
        }
      },
      grid: { left: 220, right: 32, top: 10, bottom: 20 },
      xAxis: { type: 'value', name: 'Días cobertura' },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          width: 200,
          overflow: 'truncate'
        }
      },
      series: [{
        type: 'bar',
        data: values,
        barWidth: '60%',
        label: { show: true, position: 'right', formatter: '{c} d' },
        itemStyle: {
          color: (params: any) => colorFor(params.value as number)
        }
      }]
    };
  }
}
