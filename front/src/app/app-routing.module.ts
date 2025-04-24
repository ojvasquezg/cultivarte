import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard'; // Importar el guardia
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { TablasCadenaComponent } from './tablas-cadena/tablas-cadena.component';
import { GridPlantillasComponent } from './grid-plantillas/grid-plantillas.component';
import { GridTablasValoresComponent } from './grid-tablas-valores/grid-tablas-valores.component';
import { FormTablasValoresComponent } from './form-tablas-valores/form-tablas-valores.component';
import { ProgramacionEventosComponent } from './programacion-eventos/programacion-eventos.component'; // Importa tu componente
import { Menu2Component } from './menu2/menu2.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'menu2', component: Menu2Component},
    // Redirección correcta
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
    children:[{ path: 'plantillas', component: PlantillasComponent, canActivate: [AuthGuard] },
              { path: 'tablasCadena', component: TablasCadenaComponent, canActivate: [AuthGuard] },
              { path: 'grid-plantillas', component: GridPlantillasComponent, canActivate: [AuthGuard] },
              { path: 'grid-tablas-valores', component: GridTablasValoresComponent, canActivate: [AuthGuard] },
              { path: 'form-tablas-valores', component: FormTablasValoresComponent, canActivate: [AuthGuard] },
              { path: 'form-tablas-valores/:id', component: FormTablasValoresComponent, canActivate: [AuthGuard] },
              { path: 'eventos', component: ProgramacionEventosComponent, canActivate: [AuthGuard] }

            ]
      },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
