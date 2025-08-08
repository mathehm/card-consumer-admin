import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule, NzDropDownModule, NzButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isCollapsed = true;

  constructor(private router: Router) {}

  logout(): void {
    localStorage.removeItem('auth');
    this.router.navigate(['/login']);
  }
}
