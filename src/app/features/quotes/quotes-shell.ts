// src/app/features/quotes/quotes-shell.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// importa tu navbar standalone
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  standalone: true,
  selector: 'app-quotes-shell',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="max-w-6xl mx-auto p-6">
      <router-outlet/>
    </div>
  `
})
export class QuotesShellComponent {}
