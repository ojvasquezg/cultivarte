import {
  CalendarOptions,
  EventAddArg,
  EventClickArg,
} from '@fullcalendar/core'; // ❌ Eliminado DateClickArg
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es'; // 👈 Importar el idioma español
import { HostListener } from '@angular/core';
import { ProgramacionEventosService } from './programacion-eventos.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EventosSesionesParticipantes } from '../models/eventos-sesiones-participantes.interface';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { FormControl } from '@angular/forms';

import { SnackbarService } from '../snackbar/snackbar.service';
import { EventosSesiones } from '../models/eventos-sesiones.interface';
import { Eventos } from '../models/eventos.interface';

import { FormsModule } from '@angular/forms';
import { GridEventosSesionesComponent } from '../grid-eventos-sesiones/grid-eventos-sesiones.component';
import { GridEventosSesionesParticipantesComponent } from '../grid-eventos-sesiones-participantes/grid-eventos-sesiones-participantes.component';

import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

type Registro = EventosSesiones;

@Component({
  selector: 'app-programacion-eventos',
  templateUrl: './programacion-eventos.component.html',
  styleUrls: ['./programacion-eventos.component.css'],
  standalone: false,
})
export class ProgramacionEventosComponent implements OnInit {
  nombreEventoControl = new FormControl(); // Control para el autocompletar
  ejeTematicoControl = new FormControl(); // Control para el autocompletar
  tipoEventoControl = new FormControl(); // Control para el autocompletar
  ubicacionControl = new FormControl(); // Control para el autocompletar

  filteredNombresEventos: Observable<any[]> = of([]);
  filteredEjesTematicos: Observable<any[]> = of([]);
  filteredTipoEventos: Observable<any[]> = of([]);
  filteredUbicaciones: Observable<any[]> = of([]);

  evento: Eventos = {
    tipoEdicion: null,
    idSesion: 0,
    nombreSesion: null,
    idNombreEvento: null,
    desde: null,
    hasta: null,
    ejeTematico: null,
    tipoEvento: null,
    ubicacion: null,
    idEjeTematico: null,
    idTipoEvento: null,
    idUbicacion: null,
    descripcionGrupo: null,
    aliado: null,
    idResponsable: null,
    noAtencion: null,
    motivoNoAtencion: null,
    desdeNoAtencion: null,
    hastaNoAtencion: null,
    esInstitucional: null,
  };

  events: any[] = [{ title: 'Evento de prueba', start: new Date() }];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    locale: esLocale, // 👈 Establecer el idioma español
    events: this.events,
    eventClick: (clickInfo: EventClickArg) => this.handleEventClick(clickInfo),
    dateClick: (arg: any) => this.handleDateClick(arg),
    viewDidMount: this.handleViewChange.bind(this), // Manejar cambio de vista // ✅ Cambiado a "arg: any"
    editable: true,
    selectable: true,
  };

  // Formulario
  showForm = false;
  selectedEvent: any | null = null;

  registrosFiltrados: any[] = [];
  registros: any[] = []; // Aquí se almacenarán todos los registros

  terminoDeBusqueda: string = ''; // Almacena el término de búsqueda
  paginaActual: number = 1; // Página actual
  registrosPorPagina: number = 5; // Elementos por página
  registrosPaginados: any[] = []; // Registro para mostrar en la pagina actual
  nroRegistrosPorPagina: number[] = [5, 10, 20, 30]; // Opciones para elementos por página
  ordenarColumna: string = ''; // Columna que se está ordenando
  ordenarDireccion: string = ''; // Dirección de ordenamiento (ascendente o descendente)
  maestraId!: number;
  calendarMode: 'week' | 'day' | 'month' = 'month'; // Modo inicial por defecto
  selectedDate: Date | null = null; // Fecha seleccionada, inicialmente null
  ejesTematicos: any[] = [];
  tiposEventos: any[] = [];
  ubicaciones: any[] = [];
  nombresEventos: any[] = [];
  responsables: any[] = [];
  beneficiarios: any[] = [];
  constructor(
    private cdr: ChangeDetectorRef,
    private snackbarService: SnackbarService,
    private programacionEventosService: ProgramacionEventosService
  ) {
    //Esto para detectar cambios en los autocompletar
    this.filteredNombresEventos = this.nombreEventoControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterNombresEventos(value))
    );
    // Escuchar cambios en el FormControl para manejar coincidencias exactas
    this.nombreEventoControl.valueChanges.subscribe((value) => {
      if (typeof value === 'string' && value) {
        console.log('Valor ingresado:', value); // Verificar el valor ingresado
        const matchingEvento = this.nombresEventos.find(
          (nombreEvento) =>
            nombreEvento.valor.toLowerCase() === value.toLowerCase()
        );
        if (matchingEvento) {
          console.log('ID del evento:', matchingEvento.id);
          this.evento.idNombreEvento = matchingEvento.id;
          this.nombreEventoControl.setValue(matchingEvento, {
            emitEvent: false,
          });
        }
      }
    });

    this.filteredEjesTematicos = this.ejeTematicoControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterEjesTematicos(value))
    );
    // Escuchar cambios en el FormControl para manejar coincidencias exactas
    this.ejeTematicoControl.valueChanges.subscribe((value) => {
      if (typeof value === 'string' && value) {
        console.log('Valor ingresado:', value); // Verificar el valor ingresado
        const matchingEvento = this.ejesTematicos.find(
          (ejeTematico) =>
            ejeTematico.valor.toLowerCase() === value.toLowerCase()
        );
        if (matchingEvento) {
          console.log('ID del eje tematico:', matchingEvento.id);
          this.evento.idEjeTematico = matchingEvento.id;
          this.ejeTematicoControl.setValue(matchingEvento, {
            emitEvent: false,
          });
        }
      }
    });

    // Escuchar cambios en el FormControl para manejar coincidencias exactas
    this.filteredTipoEventos = this.tipoEventoControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterTipoEventos(value))
    );
    this.tipoEventoControl.valueChanges.subscribe((value) => {
      if (typeof value === 'string' && value) {
        console.log('Valor ingresado:', value); // Verificar el valor ingresado
        const matchingEvento = this.tiposEventos.find(
          (tipoEvento) => tipoEvento.valor.toLowerCase() === value.toLowerCase()
        );
        if (matchingEvento) {
          console.log('ID del eje tematico:', matchingEvento.id);
          this.evento.idTipoEvento = matchingEvento.id;
          this.tipoEventoControl.setValue(matchingEvento, {
            emitEvent: false,
          });
        }
      }
    });
    // Escuchar cambios en el FormControl para manejar coincidencias exactas
    this.filteredUbicaciones = this.ubicacionControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterUbicaciones(value))
    );
    this.ubicacionControl.valueChanges.subscribe((value) => {
      if (typeof value === 'string' && value) {
        console.log('Valor ingresado:', value); // Verificar el valor ingresado
        const matchingEvento = this.ubicaciones.find(
          (ubicacion) => ubicacion.valor.toLowerCase() === value.toLowerCase()
        );
        if (matchingEvento) {
          console.log('ID del eje tematico:', matchingEvento.id);
          this.evento.idUbicacion = matchingEvento.id;
          this.ubicacionControl.setValue(matchingEvento, {
            emitEvent: false,
          });
        }
      }
    });
  }

  private _filterNombresEventos(value: string): any[] {
    const filterValue = value?.toLowerCase() || '';
    return this.nombresEventos.filter((nombreEvento) =>
      nombreEvento.valor.toLowerCase().includes(filterValue)
    );
  }

  private _filterEjesTematicos(value: string): any[] {
    const filterValue = value?.toLowerCase() || '';
    return this.ejesTematicos.filter((ejeTematico) =>
      ejeTematico.valor.toLowerCase().includes(filterValue)
    );
  }
  private _filterTipoEventos(value: string): any[] {
    const filterValue = value?.toLowerCase() || '';
    return this.tiposEventos.filter((tipoEvento) =>
      tipoEvento.valor.toLowerCase().includes(filterValue)
    );
  }
  private _filterUbicaciones(value: string): any[] {
    const filterValue = value?.toLowerCase() || '';

    return this.ubicaciones.filter((ubicacion) =>
      ubicacion.valor.toLowerCase().includes(filterValue)
    );
  }

  // Método para manejar la selección de un evento para autocompletar
  onNombreEventoSelected(event: any): void {
    this.evento.idNombreEvento = event.option.value.id;
    console.log('seleccionado :', event.option.value.id);
  }

  onEjeTematicoSelected(event: any): void {
    this.evento.idEjeTematico = event.option.value.id;
    console.log('seleccionado :', event.option.value.id);
  }
  onTipoEventoSelected(event: any): void {
    this.evento.idTipoEvento = event.option.value.id;
    console.log('seleccionado :', event.option.value.id);
  }
  onUbicacionSelected(event: any): void {
    this.evento.idUbicacion = event.option.value.id;
    console.log('seleccionado :', event.option.value.id);
  }

  // Método para mostrar el valor en el input
  displayNombreEvento(nombreEvento: any): string {
    return nombreEvento ? nombreEvento.valor : '';
  }
  displayEjeTematico(ejeTematico: any): string {
    return ejeTematico ? ejeTematico.valor : '';
  }
  displayTipoEvento(tipoEvento: any): string {
    return tipoEvento ? tipoEvento.valor : '';
  }
  displayUbicacion(ubicacion: any): string {
    return ubicacion ? ubicacion.valor : '';
  }

  eventosSesionesParticipantesNuevos: EventosSesionesParticipantes[] = [];
  eventosSesionesParticipantesModificados: EventosSesionesParticipantes[] = [];
  eventosSesionesParticipantesEliminados: EventosSesionesParticipantes[] = [];

  eventosSesionesNuevos: EventosSesiones[] = [];
  eventosSesionesModificados: EventosSesiones[] = [];
  eventosSesionesEliminados: EventosSesiones[] = [];

  @ViewChild('detEventosSesionesComponent')
  detEventosSesionesComponent!: GridEventosSesionesComponent;

  @ViewChild('detEventosSesionesParticipantesComponent')
  detEventosSesionesParticipantesComponent!: GridEventosSesionesParticipantesComponent;

  // Método para cambiar el modo de visualización
  cambiarModo(modo: 'week' | 'day' | 'month'): void {
    this.calendarMode = modo;
  }

  // Método para manejar la selección de una fecha
  seleccionarFecha(fecha: Date): void {
    this.selectedDate = fecha;
  }
  handleViewChange(view: any): void {
    const viewType = view.view.type;
    this.calendarMode =
      viewType === 'dayGridMonth'
        ? 'month'
        : viewType === 'timeGridWeek'
        ? 'week'
        : 'day';
    console.log('Modo de visualización:', this.calendarMode);
  }
  handleEventClick(clickInfo: EventClickArg) {
    console.log('click');
    this.snackbarService
      .confirmWithSnackbar(
        'Desea editar el evento o tomar lista?',
        'Evento',
        'Lista'
      )
      .then((tipo) => {
        if (tipo) {
          console.log('decide editar evento');
          this.loadEventData(clickInfo);
        } else {
          console.log('decide tomar lista');
          this.loadSessionData(clickInfo);
        }
      });
  }

  private loadEventData(clickInfo: EventClickArg): void {
    this.selectedEvent = clickInfo.event;
    this.evento.tipoEdicion = 'evento';
    this.evento.idSesion = this.selectedEvent.extendedProps.idSesion;
    this.evento.idNombreEvento =
      this.selectedEvent.extendedProps.idNombreEvento;
    this.evento.nombreSesion = this.selectedEvent.title;

    const start = this.selectedEvent.start;
    if (start) {
      const local = new Date(
        start.getTime() - start.getTimezoneOffset() * 60000
      );
      start.getTime() - start.getTimezoneOffset() * 60000;
      this.evento.desde = local.toISOString().slice(0, 16);
    }
    const end = this.selectedEvent.end;
    //console.log('End:', end);
    if (end) {
      const local = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
      end.getTime() - end.getTimezoneOffset() * 60000;
      this.evento.hasta = local.toISOString().slice(0, 16);
    }

    this.listenAutoComplete();
    this.setCurrentValuesAutocomplete();
    this.showForm = true;
  }

  private setCurrentValuesAutocomplete() {
    this.ejeTematicoControl.setValue(
      this.ejesTematicos.find(
        (e) => e.id === this.selectedEvent.extendedProps.idEjeTematico
      )
    );
    this.tipoEventoControl.setValue(
      this.tiposEventos.find(
        (t) => t.id === this.selectedEvent.extendedProps.idTipoEvento
      )
    );
    this.ubicacionControl.setValue(
      this.ubicaciones.find(
        (u) => u.id === this.selectedEvent.extendedProps.idUbicacion
      )
    );
    this.nombreEventoControl.setValue(
      this.nombresEventos.find(
        (n) => n.id === this.selectedEvent.extendedProps.idNombreEvento
      )
    );
  }

  private listenAutoComplete() {
    //Esto se hace por cada autocomplete
    const nombreEvento = this.nombresEventos.find(
      (ne) => ne.id === this.evento.idNombreEvento
    );
    this.nombreEventoControl.setValue(nombreEvento || null, {
      emitEvent: false,
    });
    if (!nombreEvento) {
      this.evento.idNombreEvento = null;
      console.warn(
        'No se encontró un nombreEvento para id:',
        this.evento.idNombreEvento
      );
    }

    const ejeTematico = this.ejesTematicos.find(
      (ne) => ne.id === this.evento.idEjeTematico
    );
    this.ejeTematicoControl.setValue(ejeTematico || null, {
      emitEvent: false,
    });
    if (!ejeTematico) {
      this.evento.idEjeTematico = null;
      console.warn(
        'No se encontró un ejetematico para id:',
        this.evento.idEjeTematico
      );
    }
    const tipoEvento = this.tiposEventos.find(
      (ne) => ne.id === this.evento.idTipoEvento
    );
    this.tipoEventoControl.setValue(tipoEvento || null, {
      emitEvent: false,
    });
    if (!tipoEvento) {
      this.evento.idTipoEvento = null;
      console.warn(
        'No se encontró un tipoEvento para id:',
        this.evento.idTipoEvento
      );
    }
    const ubicacion = this.ubicaciones.find(
      (ne) => ne.id === this.evento.idUbicacion
    );
    this.ubicacionControl.setValue(ubicacion || null, {
      emitEvent: false,
    });
    if (!ubicacion) {
      this.evento.idUbicacion = null;
      console.warn(
        'No se encontró un ubicacion para id:',
        this.evento.idUbicacion
      );
    }
  }

  private loadSessionData(clickInfo: EventClickArg): void {
    this.selectedEvent = clickInfo.event;
    this.evento.tipoEdicion = 'sesion';
    this.evento.idSesion = this.selectedEvent.extendedProps.idSesion;
    this.evento.idNombreEvento =
      this.selectedEvent.extendedProps.idNombreEvento;
    this.evento.nombreSesion = this.selectedEvent.title;
    //this.eventDate = this.selectedEvent.start?.toISOString().slice(0, 16);

    const start = this.selectedEvent.start;
    if (start) {
      const local = new Date(
        start.getTime() - start.getTimezoneOffset() * 60000
      );
      start.getTime() - start.getTimezoneOffset() * 60000;
      this.evento.desde = local.toISOString().slice(0, 16);
    }
    const end = this.selectedEvent.end;
    //console.log('End:', end);
    if (end) {
      const local = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
      end.getTime() - end.getTimezoneOffset() * 60000;
      this.evento.hasta = local.toISOString().slice(0, 16);
    }
    console.log('Datos extendidos:', this.selectedEvent.extendedProps);
    this.evento.ejeTematico = this.selectedEvent.extendedProps.ejeTematico;
    this.evento.tipoEvento = this.selectedEvent.extendedProps.tipoEvento;
    this.evento.ubicacion = this.selectedEvent.extendedProps.ubicacion;

    this.evento.descripcionGrupo =
      this.selectedEvent.extendedProps.descripcionGrupo;
    this.evento.aliado = this.selectedEvent.extendedProps.aliado;
    this.evento.idResponsable = this.selectedEvent.extendedProps.id_responsable;
    this.evento.noAtencion = this.selectedEvent.extendedProps.noAtencion;
    this.evento.motivoNoAtencion =
      this.selectedEvent.extendedProps.motivoNoAtencion;
    this.evento.desdeNoAtencion =
      this.selectedEvent.extendedProps.desdeNoAtencion;
    this.evento.hastaNoAtencion =
      this.selectedEvent.extendedProps.hastaNoAtencion;
    this.evento.esInstitucional =
      this.selectedEvent.extendedProps.es_institucional;
    this.listenAutoComplete();
    this.setCurrentValuesAutocomplete();
    this.showForm = true;
    this.showForm = true;
  }

  handleDateClick(arg: any) {
    const date = arg.date; // arg.date es un objeto Date en la zona horaria local
    this.evento.tipoEdicion = 'evento';
    if (!isNaN(date.getTime())) {
      // Crear un nuevo Date con la fecha y hora completas (año, mes, día, horas, minutos, segundos)
      this.selectedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      );
    } else {
      this.selectedDate = null; // O una fecha predeterminada, como new Date()
    }
    console.log('Fecha seleccionada padre:', this.selectedDate);

    this.selectedEvent = null;
    this.evento.nombreSesion = '';

    // Convertir la fecha clickeada al ISO local con GMT -5 (Colombia)
    const localISOTime = new Date(
      arg.date.getTime() - arg.date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    this.evento.desde = localISOTime;
    this.evento.hasta = localISOTime;
    this.evento.ejeTematico = '';
    this.evento.tipoEvento = '';
    this.evento.ubicacion = '';
    this.evento.idEjeTematico = null;
    this.evento.idTipoEvento = null;
    this.evento.idUbicacion = null;
    this.evento.idNombreEvento = null;
    this.showForm = true;
    this.evento.descripcionGrupo = '';
    this.listenAutoComplete();
    this.setCurrentValuesAutocomplete();
    this.evento.idSesion = 0; // Reiniciar el ID de la sesión al crear un nuevo evento
  }

  guardarEvento() {
    console.log('Evento::', this.evento.idSesion);
    if (this.evento.idSesion === 0 || this.evento.idSesion === null) {
      this.detEventosSesionesComponent.emitirRegistros();
      console.log(
        'antes de guardar sesiones:',
        this.detEventosSesionesComponent?.registrosNuevos ?? []
      );
    } else {
      this.detEventosSesionesParticipantesComponent.emitirRegistros();
    }

    const detalles = {
      sesiones: this.detEventosSesionesComponent?.registrosNuevos ?? [],
      participantesNuevos: (
        this.detEventosSesionesParticipantesComponent?.registrosNuevos ?? []
      ).map((p) => ({
        ...p,
        id_participante:
          p.id_participante != null
            ? parseInt(p.id_participante as any, 10)
            : null,
      })),
      participantesModificados: (
        this.detEventosSesionesParticipantesComponent?.registrosModificados ??
        []
      ).map((p) => ({
        ...p,
        id_participante:
          p.id_participante != null
            ? parseInt(p.id_participante as any, 10)
            : null,
      })),
      participantesEliminados: (
        this.detEventosSesionesParticipantesComponent?.registrosEliminados ?? []
      ).map((p) => ({
        ...p,
        id_participante:
          p.id_participante != null
            ? parseInt(p.id_participante as any, 10)
            : null,
      })),
    };
    console.log(
      'Participantes nuevos en el componente:',
      detalles.participantesNuevos
    );
    //Developer: Llamar al servicio para guardar el registro, se envia la entidad maestra y los detalles (uno por uno)
    this.programacionEventosService
      .guardarEvento(this.evento, detalles)
      .subscribe(
        (response) => {
          //Developer: Se ajusta despues de data, de acuerdo a la respuesta de la mutacion del backend
          if (response.data.insupdEventos.respuesta === true) {
            console.log(
              'Registro guardado correctamente:',
              response.data.insupdEventos.data
            );
            this.cargarEventos(); // Cargar eventos al iniciar el componente
          } else {
            console.log(
              'Error al guardar el registro:',
              response.data.insupdEventos.mensaje
            );
          }
        },
        (error) => {
          //Developer: El mensaje debe estar registrador en el archivo de errores
          //this.notificationService.showError(error);
        }
      );
    //Esto se debe hacer si no hay errores, por ahora queda asi
    this.closeForm();
    //console.log('Eventos', this.events);
  }

  closeForm() {
    this.showForm = false;
    this.evento.idSesion = 0;
    this.selectedEvent = null;
    this.evento.nombreSesion = '';
    this.evento.desde = null;
    this.evento.hasta = null;
    this.evento.ejeTematico = '';
    this.evento.tipoEvento = '';
    this.evento.ubicacion = '';
    this.evento.idEjeTematico = null;
    this.evento.idTipoEvento = null;
    this.evento.idUbicacion = null;
    this.evento.idNombreEvento = null;
    this.showForm = false;
    this.evento.descripcionGrupo = '';
  }
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.showForm) {
      this.closeForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {
    //console.log('oninit');
    this.maestraId = 0;

    this.cargarEventos(); // Cargar eventos al iniciar el componente
    this.cargarParametros();
    //console.log('Eventos:', this.events);
  }
  cargarEventos() {
    this.programacionEventosService.getSesionesEventos().subscribe(
      (response) => {
        const sesiones = response.data.listSesiones;
        //console.log('Sesiones:', sesiones);

        const eventos = sesiones.map((sesion: any) => ({
          idSesion: sesion.id_sesion,
          title: `(${sesion.id_sesion}) ${sesion.nombre_sesion} `,
          start: new Date(sesion.desde),
          end: new Date(sesion.hasta),
          extendedProps: {
            ejeTematico: sesion.eje_tematico,
            tipoEvento: sesion.tipo_evento,
            ubicacion: sesion.ubicacion,
            idEjeTematico: sesion.id_eje_tematico,
            idTipoEvento: sesion.id_tipo_evento,
            idUbicacion: sesion.id_ubicacion,
            idSesion: sesion.id_sesion,
            idNombreEvento: sesion.id_nombre_evento,
            descripcionGrupo: sesion.descripcion_grupo,
            aliado: sesion.aliado,
            id_responsable: sesion.id_responsable,
            noAtencion: sesion.no_atencion,
            motivoNoAtencion: sesion.motivo_no_atencion,
            es_institucional: sesion.es_institucional,
            desdeNoAtencion: sesion.desde_no_atencion,
            hastaNoAtencion: sesion.hasta_no_atencion,
          },
        }));

        this.calendarOptions.events = eventos; // 🔥 esto sí actualiza FullCalendar
        //console.log('eventos:', eventos);
      },
      (error) => {
        console.error('Error cargando sesiones:', error);
      }
    );
  }
  cargarParametros() {
    this.programacionEventosService.getParametros().subscribe(
      (response) => {
        const parametros = response.data.listParametros;
        //console.log('Parametros:', parametros);

        this.ejesTematicos = parametros.ejesTematicos;
        this.tiposEventos = parametros.tiposEventos;
        this.ubicaciones = parametros.ubicaciones;
        this.nombresEventos = parametros.nombresEventos;
        this.responsables = parametros.responsables;
        this.beneficiarios = parametros.beneficiarios;
        //console.log('Beneficiarios:', this.beneficiarios);

        //console.log('Ejes temáticos:', this.ejesTematicos);
        //console.log('Tipos de evento:', this.tiposEventos);
        //console.log('Ubicaciones:', this.ubicaciones);
        //console.log('nombres eventos:', this.nombresEventos);
        //console.log('responsables:', this.responsables);
      },
      (error) => {
        console.error('Error cargando sesiones:', error);
      }
    );
  }

  /**************************Recibir los detalles*************** */

  recibirEventosSesionesParticipantes(event: {
    nuevos: EventosSesionesParticipantes[];
    modificados: EventosSesionesParticipantes[];
    eliminados: EventosSesionesParticipantes[];
  }) {
    this.eventosSesionesParticipantesNuevos = event.nuevos;
    this.eventosSesionesParticipantesModificados = event.modificados;
    this.eventosSesionesParticipantesEliminados = event.eliminados;
  }

  recibirEventosSesiones(event: {
    nuevos: EventosSesiones[];
    modificados: EventosSesiones[];
    eliminados: EventosSesiones[];
  }) {
    this.eventosSesionesNuevos = event.nuevos;
    this.eventosSesionesModificados = event.modificados;
    this.eventosSesionesEliminados = event.eliminados;
  }
  /***********************Fin recibir detalles *********************/
}
