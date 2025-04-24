import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  SimpleChanges,
} from '@angular/core';

import { Router, ActivatedRoute, RouterModule, Routes } from '@angular/router';
import { FormTablasValoresService } from './form-tablas-valores.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TablasValores } from '../models/tablas-valores.interface';
import { ErrorMessageService } from '../services/error-message.service';
import { NotificationService } from '../services/notification.service';
import { CanDeactivate } from '@angular/router';
import { TablasValoresItems } from '../models/tablas-valores-items.interface';
import { SnackbarService } from '../snackbar/snackbar.service';
import { GridTablasValoresItemsComponent } from '../grid-tablas-valores-items/grid-tablas-valores-items.component';

interface Modulo {
  id: Number;
  nombre: string;
}
interface Response {
  respuesta: boolean;
  mensaje: string;
  data: TablasValores; // Usa la interfaz existente para el objeto "data" del response de la maestra
}
@Component({
  selector: 'app-form-tablas-valores',
  standalone: false,
  templateUrl: './form-tablas-valores.component.html',
  styleUrl: '../css/styles.css',
})
export class FormTablasValoresComponent implements OnInit, CanDeactivate<any> {
  //Developer: Formulario principal
  formGroup!: FormGroup;

  //Developer: Variables para manejar los detalles. Debe crear tres arreglos por cada detalle
  tablasValoresItemsNuevos: TablasValoresItems[] = [];
  tablasValoresItemsModificados: TablasValoresItems[] = [];
  tablasValoresItemsEliminados: TablasValoresItems[] = [];

  constructor(
    private formTablasValoresService: FormTablasValoresService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private errorMessageService: ErrorMessageService,
    private notificationService: NotificationService,
    private snackbarService: SnackbarService
  ) {}

  modulos: Modulo[] = [];

  //Developer: Variable para manejar el registro principal. Ajustar de acuerdo a la entidad maestra
  registro: TablasValores = {
    id: 0,
    nombre: '',
    id_modulo: null,
    id_usuario: null,
    id_usuario_modificacion: null,
    fecha_creacion: null,
    fecha_modificacion: null,
    usuario: null,
    usuario_modificacion: null,
  };

  /***Referenciar los detalles ******* */
  //Developer: Referenciar los componentes hijos
  @ViewChild('DetTablasValoresItems')
  detTablasValoresItems!: GridTablasValoresItemsComponent;

  inicializarFormulario(): void {
    //Developer: Inicializar el formulario de acuerdo a la entidad maestra
    this.formGroup = this.fb.group({
      id: [0],
      nombre: ['', Validators.required],
      id_modulo: [null, Validators.required],
      id_usuario: [null],
      id_usuario_modificacion: [null],
      fecha_creacion: [null],
      fecha_modificacion: [null],
      usuario: [null],
      usuario_modificacion: [null],
    });
  }
  ngOnInit(): void {
    this.inicializarFormulario();

    this.loadModulos();
    //Developer: Cargar los datos del registro si viene el ID. De acuerdo a lo definido en el routing
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID recibido:', id);
    if (id) {
      this.consultaPorId(parseInt(id));
    }

    this.route.params.subscribe((params) => {
      const nuevoId = +params['id']; // Convierte el parámetro a número

      if (nuevoId) {
        this.consultaPorId(nuevoId);
      } else {
        this.formGroup.reset();
        this.inicializarFormulario();
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {}
  loadModulos(): void {
    this.formTablasValoresService.loadModulos().subscribe({
      next: (data) => {
        this.modulos = data;
      },
      error: (err) => {
        console.error('Error al cargar módulos:', err);
      },
    });
  }
  //Developer: Método para guardar el registro. Ajustar de acuerdo a la entidad maestra y los detalles
  guardarRegistro() {
    if (this.formGroup.invalid) {
      Object.values(this.formGroup.controls).forEach((control) => {
        control.markAsTouched();
        this.notificationService.showError(
          'Hay datos que no son válidos o se encuentran incompletos.'
        );
      });
      return;
    }

    //Developer:Llamar al metodo validarAntesDeGuardar de cada detalle
    if (!this.detTablasValoresItems.validarAntesDeGuardar()) {
      this.notificationService.showError(
        'Hay datos en el detalle que no son válidos o encuentran incompletos.'
      );
      return;
    }

    if (this.formGroup.valid) {
      const maestra = this.formGroup.value;
      //Developer:Esto para "traer" los registros de cada detalle"
      this.detTablasValoresItems.emitirRegistros();

      //Developer: Armar el objeto a enviar al servicio, uno por cada detalle
      const detalles = {
        nuevos: this.detTablasValoresItems.registrosNuevos,
        modificados: this.detTablasValoresItems.registrosModificados,
        eliminados: this.detTablasValoresItems.registrosEliminados,
      };
      //Developer: Llamar al servicio para guardar el registro, se envia la entidad maestra y los detalles (uno por uno)
      this.formTablasValoresService.guardar(maestra, detalles).subscribe(
        (response) => {
          //Developer: Se ajusta despues de data, de acuerdo a la respuesta de la mutacion del backend
          if (response.data.insupdTablasValores.respuesta === true) {
            //Developer:Se obtiene data de acuerdo a la mutación del backend
            let data = response.data.insupdTablasValores.data;

            //Developer: Se ajusta de acuerdo a la entidad maestra
            this.formGroup.patchValue({
              id: data.id,
              nombre: data.nombre,
              fecha_creacion: data.fecha_creacion,
              fecha_modificacion: data.fecha_modificacion,
            });
            this.notificationService.showSuccess(
              //Developer:Se muestra el mensaje de acuerdo a la mutación del backend
              response.data.insupdTablasValores.mensaje
            );
            //Developer:Si hay regitros nuevos en cada detalle, llegan en el arreglo nuevosIds
            //Para actualizar el id de cada detalle. Se debe tener en cuenta cual es la clave unica
            //simple o compuesta de los detalles.
            if (response.data.insupdTablasValores.nuevosIds.length > 0) {
              //Developer:Se llama a cada detalle para actualizar el id
              this.detTablasValoresItems.actualizarNuevosId(
                response.data.insupdTablasValores.nuevosIds
              );
            }
            this.detTablasValoresItems.limpiarRegistrosPostUpdate();
          } else {
            //Developer:Se muestra el mensaje de error de acuerdo a la mutación del backend
            //El mensaje debe estar registrador en el archivo de errores
            const mensaje = this.errorMessageService.getErrorMessage(
              response.data.insupdTablasValores.mensaje
            );
            this.notificationService.showError(mensaje);
          }
        },
        (error) => {
          //Developer: El mensaje debe estar registrador en el archivo de errores
          this.notificationService.showError(error);
        }
      );
    } else {
      //Developer: Si fuera necesario manejar errores de validación
    }
  }

  //Developer: Método para verificar si el formulario tiene cambios
  hasUnsavedChanges(): boolean {
    return this.formGroup.dirty;
    //Developer: Devuelve true si el formulario ha sido modificado
  }

  //Developer: Método para manejar la navegación
  canDeactivate(): boolean {
    if (this.hasUnsavedChanges()) {
      return true;
    }
    return false; // Permite la navegación si no hay cambios
  }

  //Developer: Método para abandonar el registro. Puede ser por "Cancelar" o por "Nuevo registro"
  abandonarRegistro(mensaje: string, destino: string): void {
    var hayDetalles: Boolean = false;
    //Developer: Llamar al metodo emitirRegistros de cada detalle para actualizar los arreglos de cambios
    this.detTablasValoresItems.emitirRegistros();

    //Developer: Verificar si hay cambios en los detalles
    if (
      this.tablasValoresItemsNuevos?.length !== 0 ||
      this.tablasValoresItemsModificados?.length !== 0 ||
      this.tablasValoresItemsEliminados?.length !== 0
    ) {
      hayDetalles = true;
    }

    if (!this.canDeactivate() && !hayDetalles) {
      this.formGroup.reset();
      this.router.navigate([destino]);
    } else {
      this.snackbarService.showConfirmMessage(
        mensaje,
        'Sí',
        'No',
        () => {
          this.formGroup.reset();
          this.router.navigate([destino]);
        },
        () => {
          console.log('Acción cancelada');
        }
      );
    }
  }

  cancelar() {
    this.abandonarRegistro(
      '⚠️ Si sales ahora, perderás los cambios realizados. ¿Deseas salir de todos modos?',
      '/dashboard/grid-tablas-valores'
    );
  }

  eliminarRegistro() {
    var mensaje: string = 'Esta seguro de eliminar el registro?';
    var destino = '/dashboard/grid-tablas-valores';
    this.snackbarService.showConfirmMessage(
      mensaje,
      'Sí',
      'No',
      () => {
        this.formTablasValoresService
          .eliminarRegistro(this.formGroup.get('id')?.value)
          .subscribe((response) => {
            //Developer: Ajustar de acuerdo a la mutación del backend para el borrado
            if (response.data.deleteTablasValores.respuesta === false) {
              //Developer:Se muestra el mensaje de error de acuerdo a la mutación del backend
              //El mensaje debe estar registrador en el archivo de errores
              const message = this.errorMessageService.getErrorMessage(
                response.data.deleteTablasValores.mensaje
              );
              this.notificationService.showError(message);
            } else {
              //Developer:Se muestra el mensaje de exito de acuerdo a la mutación del backend
              //El mensaje debe estar registrador en el archivo de errores
              this.notificationService.showSuccess(
                response.data.deleteTablasValores.mensaje
              );
              this.formGroup.reset();
              this.router.navigate([destino]);
            }
          });

      },
      () => {
        console.log('Acción cancelada');
      }
    );

    /*

    this.formTablasValoresService
      .eliminarRegistro(this.formGroup.get('id')?.value)
      .subscribe((response) => {
        //Developer: Ajustar de acuerdo a la mutación del backend para el borrado
        if (response.data.deleteTablasValores.respuesta === false) {
          //Developer:Se muestra el mensaje de error de acuerdo a la mutación del backend
            //El mensaje debe estar registrador en el archivo de errores
          const message = this.errorMessageService.getErrorMessage(
            response.data.deleteTablasValores.mensaje
          );

          this.notificationService.showError(message);
        } else {
          //Developer:Se muestra el mensaje de exito de acuerdo a la mutación del backend
            //El mensaje debe estar registrador en el archivo de errores
          this.notificationService.showSuccess(
            response.data.deleteTablasValores.mensaje
          );
          this.irAGrid();
        }
      });
      */
  }

  consultaPorId(id: number): void {
    this.formTablasValoresService.consultaPorId(id).subscribe((response) => {
      if (response !== null && response.respuesta) {
        this.registro = response.data;
        //Developer: Ajustar de acuerdo a la entidad maestra
        this.formGroup.patchValue({
          id: this.registro.id,
          nombre: this.registro.nombre,
          id_modulo: this.registro.id_modulo,
          id_usuario: this.registro.id_usuario,
          // id_usuario_modificacion=this.registro.id_usuario_modificacion,
          fecha_creacion: this.registro.fecha_creacion,
          fecha_modificacion: this.registro.fecha_modificacion,
          usuario: this.registro.usuario,
          usuario_modificacion: this.registro.usuario_modificacion,
        });
      } else {
        this.notificationService.showError(`Registro ${id} no existe`);
      }
    });
  }
  //Developer: Ajustar el destino de la navegación
  nuevo(id: number) {
    const destino = `/dashboard/form-tablas-valores/${id}`;
    this.abandonarRegistro(
      '⚠️ Si sales ahora, perderás los cambios realizados. ¿Deseas salir de todos modos?',
      destino
    );
  }

  irAGrid() {
    const destino = '/dashboard/grid-tablas-valores/';
    this.router.navigate([destino]);
  }

  /**********Para manejo de los detalles***********/

  //Developer: Método para recibir los datos de los detalles. Uno por cada detalle
  recibirTablasValoresItems(event: {
    nuevos: TablasValoresItems[];
    modificados: TablasValoresItems[];
    eliminados: TablasValoresItems[];
  }) {
    this.tablasValoresItemsNuevos = event.nuevos;
    this.tablasValoresItemsModificados = event.modificados;
    this.tablasValoresItemsEliminados = event.eliminados;
  }
  /*****************Fin manejo de detalles*************/
}
