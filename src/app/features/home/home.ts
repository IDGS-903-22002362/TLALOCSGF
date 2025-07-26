import { Component } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule }  from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls:  ['./home.css'],
  imports: [CommonModule, RouterModule, MatButtonModule]
})
export class HomeComponent {}
