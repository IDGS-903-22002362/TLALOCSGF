import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { DashboardService, AdminDashboardDto, ClientDashboardDto } from '../../core/services/dashboard';
import { AuthService } from '../../core/services/auth';
import { FormsModule } from '@angular/forms';


@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, NgxEchartsModule,FormsModule],
  template: `
  <section class="max-w-7xl mx-auto p-6">

    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>

      <div class="flex items-center gap-2">
        <input type="date" class="border rounded px-2 py-1" [(ngModel)]="from" (change)="load()">
        <input type="date" class="border rounded px-2 py-1" [(ngModel)]="to" (change)="load()">
        <button class="px-3 py-2 rounded bg-emerald-700 text-white hover:bg-emerald-600" (click)="preset(7)">7d</button>
        <button class="px-3 py-2 rounded bg-emerald-700 text-white hover:bg-emerald-600" (click)="preset(30)">30d</button>
      </div>
    </div>

    <!-- ADMIN -->
    <ng-container *ngIf="isAdmin(); else clientTpl">
      <div class="grid md:grid-cols-5 gap-3">
        <div class="kpi" *ngIf="admin()?.kpis as k">
          <div class="kpi-card">Ventas<br><span>{{ k.sales | currency }}</span></div>
          <div class="kpi-card">Órdenes<br><span>{{ k.orders }}</span></div>
          <div class="kpi-card">Cot. pendientes<br><span>{{ k.pendingQuotes }}</span></div>
          <div class="kpi-card">Tickets abiertos<br><span>{{ k.openTickets }}</span></div>
          <div class="kpi-card">Bajo stock<br><span>{{ k.lowStock }}</span></div>
        </div>
      </div>

      <div class="mt-6 grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 card">
          <h2 class="card-title">Ventas por día</h2>
          <div echarts [options]="salesOpt()" class="h-72 w-full"></div>
        </div>

        <div class="card">
          <h2 class="card-title">Top productos</h2>
          <div echarts [options]="topOpt()" class="h-72 w-full"></div>
        </div>
      </div>

      <div class="mt-6 card">
        <h2 class="card-title">Materiales con bajo stock</h2>
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
              <tr *ngIf="!admin() || admin()?.lowStock?.length===0">
                <td colspan="2" class="p-3 text-center text-gray-500">Sin alertas 🎉</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>

    <!-- CLIENTE -->
    <ng-template #clientTpl>
      <div class="grid md:grid-cols-4 gap-3" *ngIf="client() as c">
        <div class="kpi-card">Mis cot. borrador<br><span>{{ c.kpis.myDraftQuotes }}</span></div>
        <div class="kpi-card">Mis cot. aprobadas<br><span>{{ c.kpis.myApprovedQuotes }}</span></div>
        <div class="kpi-card">Mis tickets abiertos<br><span>{{ c.kpis.myOpenTickets }}</span></div>
        <div class="kpi-card">Compras 30d<br><span>{{ c.kpis.myOrdersTotalLast30d | currency }}</span></div>
      </div>

      <div class="mt-6 card">
        <h2 class="card-title">Mis compras por día</h2>
        <div echarts [options]="myOpt()" class="h-72 w-full"></div>
      </div>
    </ng-template>

  </section>
  `,
  styles: [`
    .kpi { @apply grid md:grid-cols-5 gap-3 w-full; }
    .card { @apply rounded-2xl border shadow-sm p-4 bg-white; }
    .card-title { @apply text-sm font-semibold text-gray-700 mb-2; }
    .kpi-card { @apply rounded-2xl border p-4 text-center bg-white shadow-sm text-gray-700; }
    .kpi-card span { @apply block text-xl font-bold text-emerald-700; }
  `]
})
export class Dashboard {
  private ds = inject(DashboardService);
  public auth = inject(AuthService);

  // señales
  admin = signal<AdminDashboardDto | null>(null);
  client = signal<ClientDashboardDto | null>(null);

  // filtros
  from = this.iso(new Date(Date.now() - 29 * 86400000));
  to   = this.iso(new Date());

  ngOnInit(): void { this.load(); }
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
      this.ds.getAdmin(this.from, this.to).subscribe({ next: d => { this.admin.set(d); this.client.set(null); }});
    } else {
      this.ds.getMe(this.from, this.to).subscribe({ next: d => { this.client.set(d); this.admin.set(null); }});
    }
  }

  // Opciones ECharts
  salesOpt = computed<EChartsOption>(() => {
    const a = this.admin();
    const x = a?.salesByDay.map(p => p.date.substring(0,10)) ?? [];
    const y = a?.salesByDay.map(p => p.value) ?? [];
    return baseLine('Ventas', x, y);
  });

  topOpt = computed<EChartsOption>(() => {
    const a = this.admin();
    const names = a?.topProducts.map(t => t.name) ?? [];
    const totals = a?.topProducts.map(t => t.total) ?? [];
    return baseBar('Top productos', names, totals);
  });

  myOpt = computed<EChartsOption>(() => {
    const c = this.client();
    const x = c?.myOrdersByDay.map(p => p.date.substring(0,10)) ?? [];
    const y = c?.myOrdersByDay.map(p => p.value) ?? [];
    return baseLine('Mis compras', x, y);
  });

  private iso(d: Date) { return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().substring(0,10); }
}

/* Helpers de chart reutilizables (sin colores forzados) */
function baseLine(name: string, x: string[], y: number[]): EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: x },
    yAxis: { type: 'value' },
    series: [{ name, type: 'line', smooth: true, areaStyle: {}, data: y }]
  };
}

function baseBar(name: string, x: string[], y: number[]): EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: x, axisLabel: { interval: 0, rotate: 20 } },
    yAxis: { type: 'value' },
    series: [{ name, type: 'bar', data: y }]
  };
}
