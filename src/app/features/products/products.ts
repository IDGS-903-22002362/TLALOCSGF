import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ProductService, Product, ProductCreateDto, ProductUpdateDto, MaterialBOM } from '../../core/services/products';
import { ProductReviewsComponent } from '../products/products-reviews';
import { AuthService } from '../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-products-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProductReviewsComponent],
  template: `
    <button data-drawer-target="separator-sidebar" data-drawer-toggle="separator-sidebar" aria-controls="separator-sidebar" type="button" class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
      <span class="sr-only">Open sidebar</span>
      <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
      </svg>
    </button>

    <aside id="logo-sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 shadow" aria-label="Sidebar">
      <div class="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-white-800">
        <a href="#" class="flex items-center ps-2.5 mb-5">
          <img src="/img/LogoMenu.png" class="h-10 me-3 sm:h-15" alt="Flowbite Logo" />
          <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Tlaloc's</span>
        </a>
        <ul class="space-y-2 font-medium">
         <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-gray hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <svg class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
               </svg>
               <span class="ms-3">Dashboard</span>
            </a>
         </li>
         <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-gray hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <svg class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                  <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/>
               </svg>
               <span class="flex-1 ms-3 whitespace-nowrap">Kanban</span>
            </a>
         </li>
         <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-gray hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <svg class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z"/>
               </svg>
               <span class="flex-1 ms-3 whitespace-nowrap">Inbox</span>
            </a>
         </li>
         <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-gray hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <svg class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
               </svg>
               <span class="flex-1 ms-3 whitespace-nowrap">Users</span>
            </a>
         </li>
         <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-gray hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <svg class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                  <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z"/>
               </svg>
               <span class="flex-1 ms-3 whitespace-nowrap">Products</span>
            </a>
         </li>
         <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-gray hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <svg class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
               </svg>
               <span class="flex-1 ms-3 whitespace-nowrap">Sign In</span>
            </a>
         </li>
         <li>
            <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-gray hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <svg class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z"/>
                  <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z"/>
                  <path d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z"/>
               </svg>
               <span class="flex-1 ms-3 whitespace-nowrap">Sign Up</span>
            </a>
         </li>
      </ul>
      </div>
    </aside>

    <div class="p-4 sm:ml-64 dark:bg-gray-200">
      <div class="border-gray-200 border-dashed rounded-lg dark:border-gray-700">
        <section class="p-6 max-w-6xl mx-auto">
          <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
            <h1 class="text-2xl font-bold dark:text-gray">Productos</h1>
            <div class="flex flex-wrap gap-2 items-end">
              <input class="border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                     type="text" [(ngModel)]="search" 
                     placeholder="Buscar por nombre" 
                     (keyup.enter)="reload()"/>
              <button class="px-4 py-2 bg-gray-100 border rounded dark:bg-gray-600 dark:text-white" 
                      (click)="clearFilters()">Limpiar</button>
              @if (isAdmin) {
  <button class="px-4 py-2 bg-green-600 text-white rounded" 
          (click)="openCreate()">Nuevo Producto</button>
}
            </div>
          </header>

          <!-- Grid de Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" >
            <div *ngFor="let p of items" 
                 class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:bg-gray-700 dark:border-gray-600">
              <div class="h-48 bg-gray-100 flex items-center justify-center dark:bg-gray-600">
                <div class="text-gray-400 flex flex-col items-center dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs mt-2">Sin imagen</span>
                </div>
              </div>
              
              <div class="p-4">
                <div class="flex justify-between items-start">
                  <h3 class="font-semibold text-lg mb-1 line-clamp-2 dark:text-white" [title]="p.name">{{p.name}}</h3>
                  <span class="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full dark:bg-emerald-900 dark:text-emerald-200">{{p.sku}}</span>
                </div>
                
                <p class="text-gray-500 text-sm mb-2 line-clamp-2 dark:text-gray-300">{{p.description || 'Sin descripción'}}</p>
                
                <div class="flex items-center justify-between mt-3">
                  <span class="font-bold text-lg dark:text-white">{{p.basePrice | currency}}</span>
                  
                  <!-- Acciones corregidas -->
                  <div class="flex gap-2" (click)="$event.stopPropagation()">
                    @if (isAdmin) {<button (click)="openEdit(p); $event.stopPropagation()" 
                            class="text-blue-600 hover:text-blue-800 p-1 dark:text-blue-400 dark:hover:text-blue-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button> }
                    @if (isAdmin) {
                    <button (click)="showBOM(p); $event.stopPropagation()" 
                            [disabled]="busy" 
                            class="text-indigo-600 hover:text-indigo-800 p-1 dark:text-indigo-400 dark:hover:text-indigo-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clip-rule="evenodd" />
                      </svg>
                    </button>}
                    @if (isAdmin) {<button (click)="delete(p); $event.stopPropagation()" 
                            [disabled]="busy" 
                            class="text-red-600 hover:text-red-800 p-1 dark:text-red-400 dark:hover:text-red-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>}
                    <!-- En la tarjeta de producto, añade este botón junto a los otros: -->
<button (click)="openReviews(p); $event.stopPropagation()" 
        class="text-purple-600 hover:text-purple-800 p-1 dark:text-purple-400 dark:hover:text-purple-300">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
</button>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="items.length === 0" class="col-span-full text-center py-10">
              <p class="text-gray-500 dark:text-gray-400">No se encontraron productos</p>
            </div>
          </div>
        </section>
        <!-- Modal de Reseñas -->
<div *ngIf="showReviews" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-700">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-bold dark:text-white">Reseñas de {{selected?.name}}</h3>
      <button (click)="closeReviews()" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <app-product-reviews [productId]="selected?.productId || 0"></app-product-reviews>
    
    <!-- Formulario para añadir reseña (opcional) -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-600">
      <h4 class="text-lg font-semibold mb-3 dark:text-white">Añadir tu reseña</h4>
      <form class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">Calificación</label>
          <div class="flex items-center">
            <ng-container *ngFor="let star of [1,2,3,4,5]; let i = index">
              <svg *ngIf="i < currentRating" (click)="setRating(i+1)" class="w-8 h-8 text-yellow-400 cursor-pointer" 
                   xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.196-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.393c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.966z"/>
              </svg>
              <svg *ngIf="i >= currentRating" (click)="setRating(i+1)" class="w-8 h-8 text-gray-300 cursor-pointer dark:text-gray-500" 
                   xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.196-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.393c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.966z"/>
              </svg>
            </ng-container>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">Comentario</label>
          <textarea class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    rows="3" placeholder="Escribe tu experiencia con este producto..."></textarea>
        </div>
        <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Enviar reseña
        </button>
      </form>
    </div>
  </div>
</div>

        <!-- Modal CREAR -->
        <div *ngIf="showCreate" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div class="bg-white rounded p-4 w-full max-w-md dark:bg-gray-700">
            <h3 class="text-lg font-semibold mb-3 dark:text-white">Nuevo Producto</h3>
            <form [formGroup]="createForm" (ngSubmit)="confirmCreate()">
              <div class="space-y-3">
                <input class="w-full border rounded px-3 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
                       placeholder="SKU" formControlName="sku">
                <input class="w-full border rounded px-3 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
                       placeholder="Nombre" formControlName="name">
                <textarea class="w-full border rounded px-3 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
                          placeholder="Descripción (opcional)" formControlName="description"></textarea>
                <input class="w-full border rounded px-3 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
                       type="number" min="0" step="0.01" placeholder="Precio Base" formControlName="basePrice">
              </div>
              <div class="mt-4 flex justify-end gap-2">
                <button type="button" class="px-4 py-2 border rounded dark:bg-gray-600 dark:text-white" 
                        (click)="closeCreate()">Cancelar</button>
                <button class="px-4 py-2 bg-green-600 text-white rounded" 
                        [disabled]="createForm.invalid || busy">Crear</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal EDITAR -->
        <div *ngIf="showEdit" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div class="bg-white rounded p-4 w-full max-w-md dark:bg-gray-700">
            <h3 class="text-lg font-semibold mb-3 dark:text-white">Editar Producto</h3>
            <form [formGroup]="editForm" (ngSubmit)="confirmEdit()">
              <div class="space-y-3">
                <input class="w-full border rounded px-3 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
                       placeholder="SKU" formControlName="sku" readonly>
                <input class="w-full border rounded px-3 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
                       placeholder="Nombre" formControlName="name">
                <textarea class="w-full border rounded px-3 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
                          placeholder="Descripción (opcional)" formControlName="description"></textarea>
                <input class="w-full border rounded px-3 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" 
                       type="number" min="0" step="0.01" placeholder="Precio Base" formControlName="basePrice">
              </div>
              <div class="mt-4 flex justify-end gap-2">
                <button type="button" class="px-4 py-2 border rounded dark:bg-gray-600 dark:text-white" 
                        (click)="closeEdit()">Cancelar</button>
                <button class="px-4 py-2 bg-blue-600 text-white rounded" 
                        [disabled]="editForm.invalid || busy">Guardar</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal LISTA DE MATERIALES (BOM) -->
        <div *ngIf="showBom" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div class="bg-white rounded p-4 w-full max-w-lg dark:bg-gray-700">
            <h3 class="text-lg font-semibold mb-3 dark:text-white">Lista de Materiales para {{selected?.name}}</h3>
            
            <div class="overflow-x-auto border rounded mb-4 dark:border-gray-600">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-600">
                  <tr>
                    <th class="p-2 text-left dark:text-white">Material</th>
                    <th class="p-2 text-left dark:text-white">Cantidad</th>
                    <th class="p-2 text-left dark:text-white">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let m of bomItems" class="border-t dark:border-gray-600">
                    <td class="p-2 dark:text-white">{{ m.name }}</td>
                    <td class="p-2 dark:text-white">{{ m.quantity }}</td>
                    <td class="p-2 dark:text-white">{{ m.unitOfMeasure }}</td>
                  </tr>
                  <tr *ngIf="bomItems.length === 0" class="border-t dark:border-gray-600">
                    <td colspan="3" class="p-4 text-center text-gray-500 dark:text-gray-400">No se han definido materiales</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-end">
              <button class="px-4 py-2 bg-indigo-600 text-white rounded" 
                      (click)="closeBOM()">Cerrar</button>
            </div>
          </div>
        </div>

        <!-- Mensaje -->
        <p *ngIf="msg" class="mt-2 text-sm" 
           [class.text-green-600]="ok" [class.text-red-600]="!ok"
           [class.dark:text-green-400]="ok" [class.dark:text-red-400]="!ok">{{ msg }}</p>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;  
      overflow: hidden;
    }
    .h-48 {
      height: 12rem;
    }
    .shadow-sm {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .hover\\:shadow-md:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  `]
})
export class ProductsListComponent implements OnInit {
  // datos
  items: Product[] = [];
  bomItems: MaterialBOM[] = [];

  // filtros
  search = '';

  // UI state
  busy = false;
  msg = ''; ok = false;

  showCreate = false;
  showEdit = false;
  showBom = false;

  showReviews = false;
  currentRating = 0;

  selected?: Product;

  // forms
  createForm!: FormGroup;
  editForm!: FormGroup;

  userRoles: string[] = [];
  isAdmin = false;

  constructor(private api: ProductService, private fb: FormBuilder, private authService: AuthService) { }

  ngOnInit(): void {
    this.createForm = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', Validators.required],
      description: [''],
      basePrice: [0, [Validators.required, Validators.min(0)]]
    });

    this.editForm = this.fb.group({
      productId: [''],
      sku: [''],
      name: ['', Validators.required],
      description: [''],
      basePrice: [0, [Validators.required, Validators.min(0)]]
    });

    this.userRoles = this.authService.roles;
  this.isAdmin = this.userRoles.includes('Admin') || this.userRoles.includes('Administrator');
  
  // Opcional: Si necesitas cargar el perfil completo
  if (this.authService.isLoggedIn()) {
    this.authService.me().subscribe(profile => {
      this.userRoles = profile.roles;
      this.isAdmin = this.userRoles.includes('Admin') || this.userRoles.includes('Administrator');
    });
  }

    this.reload();
  }
  openReviews(product: Product) {
    this.selected = product;
    this.showReviews = true;
    this.currentRating = 0;
  }

  closeReviews() {
    this.showReviews = false;
  }

  setRating(rating: number) {
    this.currentRating = rating;
  }

  /*──────────── Carga de datos ────────────*/
  reload() {
    this.busy = true;
    this.api.getAll(this.search).subscribe({
      next: (products) => {
        this.items = products;
        this.busy = false;
      },
      error: () => {
        this.toast(false, 'Error al cargar productos');
        this.busy = false;
      }
    });
  }

  clearFilters() {
    this.search = '';
    this.reload();
  }

  /*──────────── Crear Producto ────────────*/
  openCreate() {
    if (!this.isAdmin) {
    console.warn('Acceso denegado: Se requiere rol de administrador');
    return;
  }
    this.createForm.reset({ basePrice: 0 });
    this.showCreate = true;
  }

  closeCreate() {
    this.showCreate = false;
  }

  confirmCreate() {
    if (this.createForm.invalid) return;
    this.busy = true;
    this.api.create(this.createForm.value).subscribe({
      next: () => {
        this.busy = false;
        this.showCreate = false;
        this.toast(true, 'Producto creado');
        this.reload();
      },
      error: () => {
        this.busy = false;
        this.toast(false, 'Error al crear producto');
      }
    });
  }

  /*──────────── Editar Producto ────────────*/
  openEdit(product: Product) {
    console.log('Editando producto:', product);
    this.selected = product;
    this.editForm.patchValue({
      productId: product.productId,
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      basePrice: product.basePrice
    });
    this.showEdit = true;
  }

  closeEdit() {
    this.showEdit = false;
  }

  confirmEdit() {
    if (!this.selected || this.editForm.invalid) return;
    this.busy = true;
    this.api.update(this.editForm.value).subscribe({
      next: () => {
        this.busy = false;
        this.showEdit = false;
        this.toast(true, 'Producto actualizado');
        this.reload();
      },
      error: () => {
        this.busy = false;
        this.toast(false, 'Error al actualizar producto');
      }
    });
  }

  /*──────────── Eliminar Producto ────────────*/
  delete(product: Product) {
    if (!this.isAdmin) {
    console.warn('Acceso denegado: Se requiere rol de administrador');
    return;
  }
    this.busy = true;
    this.api.delete(product.productId).subscribe({
      next: () => {
        this.busy = false;
        this.toast(true, 'Producto eliminado');
        this.reload();
      },
      error: () => {
        this.busy = false;
        this.toast(false, 'Error al eliminar producto');
      }
    });
  }

  /*──────────── Lista de Materiales (BOM) ────────────*/
  showBOM(product: Product) {
    console.log('Mostrando BOM para:', product);
    this.selected = product;
    this.busy = true;
    this.api.getBOM(product.productId).subscribe({
      next: (materials) => {
        this.bomItems = materials;
        this.showBom = true;
        this.busy = false;
      },
      error: () => {
        this.busy = false;
        this.toast(false, 'Error al cargar materiales');
      }
    });
  }

  closeBOM() {
    this.showBom = false;
    this.bomItems = [];
  }

  /*──────────── Helper ────────────*/
  private toast(ok: boolean, msg: string) {
    this.ok = ok;
    this.msg = msg;
    setTimeout(() => this.msg = '', 4000);
  }
}