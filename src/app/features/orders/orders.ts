import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdersService, OrderResponseDto, OrderCreateDto, OrderStatus } from '../../core/services/orders';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  template: `
    <button data-drawer-target="separator-sidebar" data-drawer-toggle="separator-sidebar" aria-controls="separator-sidebar" type="button" 
            class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
      <span class="sr-only">Open sidebar</span>
      <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
      </svg>
    </button>

    <aside id="logo-sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 shadow" aria-label="Sidebar">
      <div class="h-full px-3 py-4 overflow-y-auto bg-gray-50">
        <a href="#" class="flex items-center ps-2.5 mb-5">
          <img src="/img/LogoMenu.png" class="h-10 me-3 sm:h-15" alt="Flowbite Logo" />
          <span class="self-center text-xl font-semibold whitespace-nowrap">Tlaloc's</span>
        </a>
        <ul class="space-y-2 font-medium">
          <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg class="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
              </svg>
              <span class="ms-3">Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/>
              </svg>
              <span class="flex-1 ms-3 whitespace-nowrap">Kanban</span>
            </a>
          </li>
          <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z"/>
              </svg>
              <span class="flex-1 ms-3 whitespace-nowrap">Inbox</span>
            </a>
          </li>
          <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
              </svg>
              <span class="flex-1 ms-3 whitespace-nowrap">Users</span>
            </a>
          </li>
          <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z"/>
              </svg>
              <span class="flex-1 ms-3 whitespace-nowrap">Products</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>

    <div class="p-4 sm:ml-64">
      <div class="border-gray-200 border-dashed rounded-lg">
        <section class="p-6 max-w-6xl mx-auto">
          <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
            <h1 class="text-2xl font-bold">Pedidos</h1>
            <!-- Filtros para Admin -->
            <div *ngIf="role === 'Admin'" class="flex flex-col sm:flex-row gap-3">
              <select class="border rounded px-3 py-2" [(ngModel)]="statusFilter" (change)="loadOrders()">
                <option value="">Todos los estados</option>
                <option *ngFor="let status of statusOptions" [value]="status">{{status}}</option>
              </select>
              <input type="date" class="border rounded px-3 py-2" [(ngModel)]="dateFilter" (change)="loadOrders()">
              <button class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300" (click)="resetFilters()">
                Limpiar
              </button>
            </div>
          </header>

          <!-- Formulario solo si eres CLIENT -->
          <div *ngIf="role === 'Client'" class="mb-6 p-4 border rounded bg-gray-50">
            <h2 class="font-semibold mb-3">Crear nueva orden</h2>
            <form [formGroup]="orderForm" (ngSubmit)="createOrder()">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="number" class="border rounded px-3 py-2" placeholder="ID Producto"
                      formControlName="productId">
                <input type="number" class="border rounded px-3 py-2" placeholder="Cantidad"
                      formControlName="quantity">
                <input type="number" step="0.01" class="border rounded px-3 py-2" placeholder="Precio unitario"
                      formControlName="unitPrice">
              </div>
              <div class="mt-3 flex justify-end gap-2">
                <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        [disabled]="orderForm.invalid || busy">
                  Crear orden
                </button>
              </div>
            </form>
          </div>

          <!-- Grid de Cards para pedidos -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let o of orders" 
                 class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-semibold text-lg">Orden #{{o.orderId}}</h3>
                  <span class="px-2 py-1 rounded-full text-xs"
                        [class.bg-blue-100]="o.status === 'Pending'"
                        [class.text-blue-800]="o.status === 'Pending'"
                        [class.bg-green-100]="o.status === 'Paid'"
                        [class.text-green-800]="o.status === 'Paid'"
                        [class.bg-yellow-100]="o.status === 'Shipped'"
                        [class.text-yellow-800]="o.status === 'Shipped'"
                        [class.bg-red-100]="o.status === 'Cancelled'"
                        [class.text-red-800]="o.status === 'Cancelled'">
                    {{o.status}}
                  </span>
                </div>
                
                <p class="text-gray-500 text-sm mb-3">
                  <span class="font-medium">Fecha:</span> {{o.orderDate | date:'mediumDate'}}
                </p>
                
                <p class="text-gray-500 text-sm mb-3">
                  <span class="font-medium">Total:</span> {{o.totalAmount | currency}}
                </p>

                <!-- Selector de estado para Admin -->
                <div *ngIf="role === 'Admin'" class="mt-3">
                  <select [ngModel]="o.status" (ngModelChange)="updateStatus(o.orderId, $event)">
  <option *ngFor="let status of statusOptions" [value]="status">{{status}}</option>
</select>

                </div>
              </div>
            </div>

            <div *ngIf="orders.length === 0" class="col-span-full text-center py-10">
              <p class="text-gray-500">No se encontraron pedidos</p>
            </div>
          </div>

          <!-- Mensaje -->
          <p *ngIf="msg" class="mt-3 text-sm" [class.text-green-600]="ok" [class.text-red-600]="!ok">
            {{ msg }}
          </p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .shadow-sm {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .hover\\:shadow-md:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  `]
})

export class OrdersComponent implements OnInit {
  orders: OrderResponseDto[] = [];
  role: string | null = null;
  busy = false;
  msg = ''; 
  ok = false;
  
  // Filtros
  statusFilter: string = '';
  dateFilter: string = '';
  statusOptions: OrderStatus[] = ['Pending', 'Paid', 'Shipped', 'Cancelled','Delivered'];

  orderForm!: FormGroup;

  constructor(
    private ordersService: OrdersService,
    private fb: FormBuilder,
    private jwt: JwtHelperService
  ) {}

  ngOnInit(): void {
    // Leer rol desde token
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = this.jwt.decodeToken(token);
      this.role = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }

    // Form solo para cliente
    this.orderForm = this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });

    // Cargar datos iniciales
    this.loadOrders();
  }

  loadOrders() {
    this.busy = true;

    if (this.role === 'Client') {
      this.ordersService.getMyOrders().subscribe({
        next: data => {
          console.log('Órdenes cliente:', data);
          this.orders = data;
          this.busy = false;
        },
        error: err => {
          console.error('Error al cargar pedidos cliente:', err);
          this.toast(false, 'No se pudieron cargar tus pedidos.');
          this.busy = false;
        }
      });
    } else if (this.role === 'Admin') {
      const from = this.dateFilter || undefined; // puedes cambiar para rango si agregas otro filtro
      const to = undefined; // aquí podrías agregar filtro para fecha hasta
      const status = this.statusFilter || undefined;

      this.ordersService.getAllOrders(from, to, status).subscribe({
        next: data => {
          console.log('Órdenes admin:', data);
          this.orders = data;
          this.busy = false;
        },
        error: err => {
          console.error('Error al cargar órdenes admin:', err);
          this.toast(false, 'No se pudieron cargar las órdenes.');
          this.busy = false;
        }
      });
    }
  }

  resetFilters() {
    this.statusFilter = '';
    this.dateFilter = '';
    this.loadOrders();
  }

  updateStatus(orderId: number, newStatus: OrderStatus) {
    if (!this.statusOptions.includes(newStatus)) {
      this.toast(false, 'Estado inválido');
      return;
    }

    this.busy = true;
    this.ordersService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.toast(true, 'Estado actualizado correctamente.');
        this.busy = false;
      },
      error: (err) => {
        this.toast(false, 'Error al actualizar el estado: ' + (err.error?.message || err.message));
        this.busy = false;
        this.loadOrders();
      }
    });
  }

  createOrder() {
    if (this.orderForm.invalid) return;

    const dto: OrderCreateDto = {
      lines: [{
        productId: this.orderForm.value.productId,
        quantity: this.orderForm.value.quantity,
        unitPrice: this.orderForm.value.unitPrice
      }]
    };

    this.busy = true;
    this.ordersService.createOrder(dto).subscribe({
      next: res => {
        this.busy = false;
        this.toast(true, res.message || 'Orden creada exitosamente.');
        this.orderForm.reset({ quantity: 1, unitPrice: 0 });
        this.loadOrders();
      },
      error: err => {
        this.busy = false;
        const mensaje = err.error || 'Error desconocido al crear la orden.';
        this.toast(false, mensaje);
      }
    });
  }

  private toast(ok: boolean, msg: string) {
    this.ok = ok;
    this.msg = msg;
    setTimeout(() => this.msg = '', 4000);
  }
}
