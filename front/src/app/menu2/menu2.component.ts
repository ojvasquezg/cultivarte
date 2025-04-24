import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Menu2Service } from './menu2.service';
interface MenuItem {
  label: string;
  route?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-menu2',
  templateUrl: './menu2.component.html',
  styleUrls: ['./menu2.component.css'],
  standalone: false,
})
export class Menu2Component {
  @Input() menuItems: MenuItem[] = [];
  @Output() sidenavClose = new EventEmitter<void>();

  constructor(private router: Router, private menu2Service: Menu2Service) {}

  navigateTo(route: string | undefined): void {
    console.log('route', route);
    if (route) {
      // Aquí puedes implementar la navegación usando Router
      console.log(`Navigating to ${route}`);
      this.router.navigate([route]);
      // Cierra el sidenav después de navegar
      this.sidenavClose.emit();
    }
  }

  ngOnInit(): void {
    this.loadMenu();
  }
  private async loadMenu() {
    try {
      const response = await this.menu2Service.getMenu().toPromise();
      console.log('Respuesta del menú:', response); // Debug
      if (response?.data?.getUserMenu?.menu) {
        this.menuItems = response.data.getUserMenu.menu;
        console.log('Opciones del menú:', this.menuItems); // Debug
        //  this.renderMenu();
      }
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  }
}
