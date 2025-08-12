// src/app/features/dashboard/dashboard.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { DashboardService, AdminDashboardDto, ClientDashboardDto } from '../../core/services/dashboard';
import { AuthService } from '../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  template: `
  <section class="max-w-7xl mx-auto p-6 space-y-6">

    <!-- Header filtros -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>

      <div class="flex flex-wrap items-center gap-2">
        <label class="text-sm text-gray-600">Desde</label>
        <input type="date" class="input" [(ngModel)]="from" (change)="load()">
        <label class="text-sm text-gray-600 ml-2">Hasta</label>
        <input type="date" class="input" [(ngModel)]="to" (change)="load()">

        <div class="ml-2 inline-flex rounded-xl border bg-white shadow-sm overflow-hidden">
          <button class="chip" (click)="preset(7)">7d</button>
          <button class="chip" (click)="preset(30)">30d</button>
          <button class="chip" (click)="preset(90)">90d</button>
        </div>
      </div>
    </div>

    <!-- ADMIN -->
    <ng-container *ngIf="isAdmin(); else clientTpl">
      <!-- KPIs -->
      <div class="grid gap-3 md:grid-cols-3 lg:grid-cols-5" *ngIf="admin(); else kpiSkeleton">
        <div class="kpi-card">
          <div class="kpi-label">Ventas</div>
          <div class="kpi-value">{{ admin()!.kpis.sales | currency }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Órdenes</div>
          <div class="kpi-value">{{ admin()!.kpis.orders }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Cot. pendientes</div>
          <div class="kpi-value">{{ admin()!.kpis.pendingQuotes }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Tickets abiertos</div>
          <div class="kpi-value">{{ admin()!.kpis.openTickets }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Bajo stock</div>
          <div class="kpi-value">{{ admin()!.kpis.lowStock }}</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="card lg:col-span-2">
          <div class="card-title">Ventas por día</div>
          <div echarts [options]="salesOpt()" class="chart"></div>
          <ng-container *ngIf="!hasData(admin()?.salesByDay)">
            <div class="empty">No hay ventas en el rango seleccionado.</div>
          </ng-container>
        </div>

        <div class="card">
          <div class="card-title">Top productos</div>
          <div echarts [options]="topOpt()" class="chart"></div>
          <ng-container *ngIf="!hasData(admin()?.topProducts)">
            <div class="empty">Sin datos de productos.</div>
          </ng-container>
        </div>
      </div>

      <!-- Bajo stock -->
      <div class="card">
        <div class="card-title">Materiales con bajo stock</div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-2 text-left">Material</th>
                <th class="p-2 text-right">Existencia</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of admin()?.lowStock" class="border-t">
                <td class="p-2">{{ m.name }}</td>
                <td class="p-2 text-right">{{ m.onHand }}</td>
              </tr>
              <tr *ngIf="!admin() || (admin()?.lowStock?.length ?? 0) === 0">
                <td colspan="2" class="p-4 text-center text-gray-500">Sin alertas 🎉</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>

    <!-- CLIENTE -->
    <ng-template #clientTpl>
      <div *ngIf="client(); else kpiSkeleton" class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div class="kpi-card">
          <div class="kpi-label">Mis cot. borrador</div>
          <div class="kpi-value">{{ client()!.kpis.myDraftQuotes }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Mis cot. aprobadas</div>
          <div class="kpi-value">{{ client()!.kpis.myApprovedQuotes }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Mis tickets abiertos</div>
          <div class="kpi-value">{{ client()!.kpis.myOpenTickets }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Compras 30d</div>
          <div class="kpi-value">{{ client()!.kpis.myOrdersTotalLast30d | currency }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Mis compras por día</div>
        <div echarts [options]="myOpt()" class="chart"></div>
        <ng-container *ngIf="!hasData(client()?.myOrdersByDay)">
          <div class="empty">Sin compras registradas en el rango.</div>
        </ng-container>
      </div>
    </ng-template>

    <!-- Skeleton KPIs -->
    <ng-template #kpiSkeleton>
      <div class="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        <div class="kpi-skeleton" *ngFor="let _ of [1,2,3,4,5]">
          <div class="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-6 w-24 bg-gray-200 rounded mt-3 animate-pulse"></div>
        </div>
      </div>
    </ng-template>

  </section>
  `,
  styles: [`
    .input { @apply rounded-xl border px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30; }
    .chip  { @apply px-3 py-2 text-sm hover:bg-emerald-50; }
    .card  { @apply rounded-2xl border bg-white shadow-sm ring-1 ring-black/5 p-4; }
    .card-title { @apply mb-2 text-sm font-semibold text-gray-700; }
    .chart { height: 20rem; width: 100%; }
    .kpi-card { @apply rounded-2xl border bg-white shadow-sm ring-1 ring-black/5 p-4 text-gray-700; }
    .kpi-label { @apply text-xs font-medium text-gray-500; }
    .kpi-value { @apply mt-1 text-2xl font-bold text-emerald-700; }
    .kpi-skeleton { @apply rounded-2xl border bg-white shadow-sm ring-1 ring-black/5 p-4; }
    .empty { @apply mt-3 rounded-xl border bg-gray-50 p-3 text-center text-sm text-gray-500; }
  `]
})
export class DashboardComponent {
  private ds = inject(DashboardService);
  private auth = inject(AuthService);

  // datos
  admin = signal<AdminDashboardDto | null>(null);
  client = signal<ClientDashboardDto | null>(null);

  // filtros (por defecto últimos 30 días)
  from = this.iso(new Date(Date.now() - 29 * 86400000));
  to   = this.iso(new Date());

  ngOnInit() { this.load(); }

  isAdmin = () => this.auth.roles?.includes('Admin');

  preset(days: number) {
    const end = new Date();
    const start = new Date(Date.now() - (days - 1) * 86400000);
    this.from = this.iso(start);
    this.to   = this.iso(end);
    this.load();
  }

  load() {
    if (this.isAdmin()) {
      this.ds.getAdmin(this.from, this.to).subscribe({
        next: d => { this.admin.set(d); this.client.set(null); }
      });
    } else {
      this.ds.getMe(this.from, this.to).subscribe({
        next: d => { this.client.set(d); this.admin.set(null); }
      });
    }
  }

  /* Helpers */
  hasData<T extends { value?: number }>(arr: any[] | undefined | null) {
    if (!arr || arr.length === 0) return false;
    // para arrays de objetos {date, value} o topProducts {total}
    const first = arr[0] as any;
    return typeof first === 'object'
      ? (('value' in first) ? arr.some(x => (x.value ?? 0) > 0)
                            : (('total' in first) ? arr.some((x: any) => (x.total ?? 0) > 0) : true))
      : true;
  }

  /* Opciones ECharts */
  salesOpt = computed<EChartsOption>(() => {
    const a = this.admin();
    const x = a?.salesByDay.map(p => p.date.slice(0, 10)) ?? [];
    const y = a?.salesByDay.map(p => p.value) ?? [];
    return lineArea('Ventas', x, y);
  });

  topOpt = computed<EChartsOption>(() => {
    const a = this.admin();
    const names = a?.topProducts.map(t => t.name) ?? [];
    const totals = a?.topProducts.map(t => t.total) ?? [];
    return bars('Total', names, totals);
  });

  myOpt = computed<EChartsOption>(() => {
    const c = this.client();
    const x = c?.myOrdersByDay.map(p => p.date.slice(0, 10)) ?? [];
    const y = c?.myOrdersByDay.map(p => p.value) ?? [];
    return lineArea('Mis compras', x, y);
  });

  private iso(d: Date) {
    // fecha plana para inputs date
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString().slice(0, 10);
  }
}

/* ============================
   Opciones base para ECharts
   ============================ */
function lineArea(name: string, x: string[], y: number[]): EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    dataZoom: [{ type: 'inside' }, { type: 'slider', height: 18, bottom: 8 }], // zoom/scroll en eje X (útil en series temporales)
    grid: { left: 40, right: 24, top: 24, bottom: 56 },
    xAxis: { type: 'category', data: x, boundaryGap: false },
    yAxis: { type: 'value' },
    series: [{
      name, type: 'line', smooth: true, showSymbol: false, data: y,
      lineStyle: { width: 3 },
      areaStyle: { opacity: 0.15 } // área suave bajo la curva
    }]
  };
}

function bars(name: string, x: string[], y: number[]): EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 24, top: 24, bottom: 56 },
    xAxis: { type: 'category', data: x, axisLabel: { interval: 0, rotate: x.length > 8 ? 25 : 0 } },
    yAxis: { type: 'value' },
    series: [{ name, type: 'bar', data: y, barMaxWidth: 36 }]
  };
}
