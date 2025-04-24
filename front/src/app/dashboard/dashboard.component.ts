import { Component , ViewChild } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  usuario: string = 'xxxx';
  currentComponent: string | null = null; // Variable para controlar qué componente mostrar
  @ViewChild('sidenav') sidenav!: MatSidenav; // Referencia al mat-sidenav

  constructor(private   dashboardService: DashboardService){}
  toggleSidenav() {
    //console.log("Menú clickeado"); // Para pruebas en la consola
  }
  ngOnInit(){
    this.obtenerUsuario();
  }
  logout() {
    //console.log("Cerrando sesión...");
    // Aquí podrías limpiar el JWT y redirigir al login
  }
  showComponent(componentName: string) {
    this.currentComponent = componentName;
  }

  obtenerUsuario():void{
    this.dashboardService.obtenerUsuario().subscribe(
      (usuario) => {
        this.usuario = usuario; // Asignar el resultado a la variable
        //console.log("USuario dashboard:",this.usuario);
      },
      (error) => {
        console.error('Error al obtener el usuario:', error);
      }
    );
  }
  closeSidenav() {
    console.log('📢 Evento sidenavClose capturado en DashboardComponent');
    this.sidenav.close();
  }
}
