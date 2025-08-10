import { Component, inject  } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule }  from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth';


@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls:  ['./home.css'],
  imports: [CommonModule, RouterModule, MatButtonModule]
})
export class HomeComponent {
  public auth = inject(AuthService);
  logout() { this.auth.logout().subscribe(); }
}
