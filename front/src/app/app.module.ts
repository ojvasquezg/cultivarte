import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // 👈 Importa FormsModule
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion'; // Importa MatExpansionModule
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { TablasCadenaComponent } from './tablas-cadena/tablas-cadena.component';
import { GridPlantillasComponent } from './grid-plantillas/grid-plantillas.component';
import { GridTablasValoresComponent } from './grid-tablas-valores/grid-tablas-valores.component';
import { FormTablasValoresComponent } from './form-tablas-valores/form-tablas-valores.component'; // ✅ Importa el componente
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmSnackbarComponent } from './shared/confirm-snackbar/confirm-snackbar.component';
import { GridTablasValoresItemsComponent } from './grid-tablas-valores-items/grid-tablas-valores-items.component';
import { ProgramacionEventosComponent } from './programacion-eventos/programacion-eventos.component';
import { GridEventosSesionesParticipantesComponent } from './grid-eventos-sesiones-participantes/grid-eventos-sesiones-participantes.component';
import { GridEventosSesionesComponent } from './grid-eventos-sesiones/grid-eventos-sesiones.component';
import { Menu2Component } from './menu2/menu2.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    PlantillasComponent,
    TablasCadenaComponent,
    GridPlantillasComponent,
    GridTablasValoresComponent,
    FormTablasValoresComponent,
    GridTablasValoresItemsComponent,
    GridEventosSesionesParticipantesComponent,
    GridEventosSesionesComponent,
    ConfirmSnackbarComponent,
    ProgramacionEventosComponent,
    Menu2Component,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatExpansionModule, // Solo el módulo
    MatMenuModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatCardModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FullCalendarModule,
  ],
  exports: [ConfirmSnackbarComponent],
  providers: [provideAnimationsAsync(), provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
