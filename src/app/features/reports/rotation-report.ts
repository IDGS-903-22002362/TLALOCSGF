import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReportsService, RotationResponse, RotationRow } from '../../core/services/reports';

@Component({
  standalone: true,
  selector: 'app-rotation-report',
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  template: `
  <section class="max-w-7xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold">Rotación de inventario</h1>

    <!-- Filtros -->
    <div class="bg-white border rounded p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label class="text-sm text-gray-600 block mb-1">Días</label>
        <input type="number" class="border rounded px-3 py-2 w-28" [(ngModel)]="days" (change)="goto(1)">
      </div>

      <div class="grow max-w-md">
        <label class="text-sm text-gray-600 block mb-1">Buscar (nombre / SKU)</label>
        <input class="border rounded px-3 py-2 w-full"
               [(ngModel)]="q"
               (keyup.enter)="goto(1)"
               placeholder="Ej. filtro, BOM-123, etc.">
      </div>

      <div>
        <label class="text-sm text-gray-600 block mb-1">Página</label>
        <div class="flex items-center gap-2">
          <button class="px-3 py-2 border rounded" (click)="prev()" [disabled]="page<=1">‹</button>
          <div class="min-w-[4rem] text-center">{{ page }}</div>
          <button class="px-3 py-2 border rounded" (click)="next()" [disabled]="page>=totalPages()">›</button>
        </div>
      </div>

      <div>
        <label class="text-sm text-gray-600 block mb-1">Tamaño</label>
        <select class="border rounded px-3 py-2" [(ngModel)]="pageSize" (change)="goto(1)">
          <option [ngValue]="20">20</option>
          <option [ngValue]="50">50</option>
          <option [ngValue]="100">100</option>
          <option [ngValue]="200">200</option>
        </select>
      </div>

      <div class="ml-auto flex gap-2">
        <button class="px-3 py-2 border rounded" (click)="download('csv')">CSV</button>
        <button class="px-3 py-2 border rounded" (click)="download('pdf')">PDF</button>
      </div>
    </div>

    <!-- Gráfica ECharts: Top 20 con menor cobertura -->
    <div class="bg-white border rounded p-4">
      <div class="mb-2 text-sm text-gray-600">
        Top 20 con menor <b>días de cobertura</b> (solo materiales con consumo &gt; 0).
      </div>
      <div echarts [options]="chartOpt" class="w-full" style="height: 420px;"></div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto border rounded">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-2 text-left">Material</th>
            <th class="p-2 text-left">SKU</th>
            <th class="p-2 text-right">Stock</th>
            <th class="p-2 text-right">Salida diaria</th>
            <th class="p-2 text-right">Días de cobertura</th>
            <th class="p-2 text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows()" class="border-t">
            <td class="p-2">{{ r.name }}</td>
            <td class="p-2">{{ r.sku || '-' }}</td>
            <td class="p-2 text-right">{{ r.stockQty }}</td>
            <td class="p-2 text-right">{{ r.avgDailyOut }}</td>
            <td class="p-2 text-right">{{ r.daysSupply === null ? 'N/A' : (r.daysSupply | number:'1.0-1') }}</td>
            <td class="p-2 text-center">
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
            <td colspan="6" class="p-4 text-center text-gray-500">Sin resultados</td>
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
        <button class="px-3 py-1 border rounded" (click)="prev()" [disabled]="page<=1">Anterior</button>
        <button class="px-3 py-1 border rounded" (click)="next()" [disabled]="page>=totalPages()">Siguiente</button>
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

  load() {
    this.api.getRotation({ days: this.days, page: this.page, pageSize: this.pageSize, q: this.q || undefined })
      .subscribe((res: RotationResponse) => {
        this.rows.set(res.rows);
        this.total.set(res.total);
        this.chartOpt = this.buildChart(res.rows);
      });
  }

  // Descargas
  download(fmt: 'csv'|'pdf') {
    this.api.exportRotation(fmt as any, { days: this.days, page: this.page, pageSize: this.pageSize, q: this.q || undefined })
      .subscribe(res => {
        const blob = res.body as Blob;
        const cd = res.headers.get('Content-Disposition') || '';
        const match = /filename="?([^"]+)"?/i.exec(cd);
        const filename = match?.[1] ?? `rotation.${fmt}`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
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

    const categories = filtered.map(r => `${r.name}${r.sku ? ' ('+r.sku+')' : ''}`);
    const values = filtered.map(r => r.daysSupply);

    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 180, right: 30, top: 10, bottom: 20 },
      xAxis: { type: 'value', name: 'Días cobertura' },
      yAxis: { type: 'category', data: categories, axisLabel: { width: 160, overflow: 'truncate' } },
      series: [{ type: 'bar', data: values }]
    };
  }
}
