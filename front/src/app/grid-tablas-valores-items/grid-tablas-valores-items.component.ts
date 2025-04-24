import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { TablasValoresItems } from '../models/tablas-valores-items.interface';
//Developer: El nombre del servicio del grid
import { GridTablasValoresItemsService } from './grid-tablas-valores-items.service';
import { SnackbarService } from '../snackbar/snackbar.service';

type Registro = TablasValoresItems;

type Estado = {
  id: string;
  nombre: string;
};

//Developer: Ajustar el selector y el templateUrl de acuerdo al componente
@Component({
  selector: 'app-grid-tablas-valores-items',
  standalone: false,
  templateUrl: './grid-tablas-valores-items.component.html',
  styleUrl: '../css/styles.css',
})
export class GridTablasValoresItemsComponent {
  @Input() maestraId!: number;

  estados: { id: string; nombre: string }[] = [
    { id: 'A', nombre: 'Activo' },
    { id: 'I', nombre: 'Inactivo' },
  ];
  //Developer: Variables estandar del grid
  registrosFiltrados: any[] = [];
  registros: any[] = []; // Aquí se almacenarán todos los registros
  registrosNuevos: Registro[] = []; // Registros nuevos
  registrosModificados: Registro[] = []; //Registros modificados
  registrosEliminados: Registro[] = []; // ID de registros eliminados

  terminoDeBusqueda: string = ''; // Almacena el término de búsqueda
  paginaActual: number = 1; // Página actual
  registrosPorPagina: number = 5; // Elementos por página
  registrosPaginados: any[] = []; // Registro para mostrar en la pagina actual
  nroRegistrosPorPagina: number[] = [5, 10, 20, 30]; // Opciones para elementos por página
  ordenarColumna: string = ''; // Columna que se está ordenando
  ordenarDireccion: string = ''; // Dirección de ordenamiento (ascendente o descendente)

  constructor(
    private gridTablasValoresItemsService: GridTablasValoresItemsService,
    private cdr: ChangeDetectorRef,
    private snackbarService: SnackbarService // Inyecta ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['maestraId'] && changes['maestraId'].currentValue) {
      if (this.maestraId !== 0) {
        this.cargarRegistros();
      } else {
        this.limpiarRegistros(); // Limpiar registros y registrosPaginados
      }
    } else {
      this.limpiarRegistros();
      this.adicionarNuevaFila(0);
    }
  }
  limpiarRegistrosPostUpdate(): void {
    this.registrosNuevos = []; // Limpiar registros nuevos
    this.registrosModificados = []; // Limpiar registros modificados
    this.registrosEliminados = []; // Limpiar registros eliminados
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  limpiarRegistros(): void {
    this.registros = []; // Limpiar registros
    this.registrosNuevos = []; // Limpiar registros nuevos
    this.registrosModificados = []; // Limpiar registros modificados
    this.registrosEliminados = []; // Limpiar registros eliminados
    this.registrosPaginados = []; // Limpiar registros paginados
    this.paginaActual = 1; // Reiniciar la página actual
    this.terminoDeBusqueda = ''; // Limpiar el término de búsqueda
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }
  cargarRegistros() {
    this.registrosNuevos = []; // Registros nuevos
    this.registrosModificados = []; //Registros modificados
    this.registrosEliminados = []; // ID de registros eliminados
    //Developer: Llamar al servicio para cargar los registros respectivos
    //Developer:Cambiar el nombre de la respuesta del servicio en response.data de acuerdo al backend
    this.gridTablasValoresItemsService
      .cargarRegistros(this.maestraId)
      .subscribe(
        (response) => {
          this.registros =
            response.data?.listTablasValoresItems?.map(
              (registro: Registro) => ({
                ...registro,
              })
            ) || [];
          //Developer: Si no hay registros, agregar un registro vacío
          if (this.registros.length === 0) {
            this.adicionarNuevaFila(0);
          }
          this.registrosFiltrados = this.registros;
          this.actualizarRegistrosPaginados();
        },
        (error) => {
          console.error('Error fetching:', error);
        }
      );
  }

  cambioDeBusqueda(): void {
    this.paginaActual = 1;
    this.filtrarRegistros();
    this.actualizarRegistrosPaginados();
  }

  actualizarRegistrosPaginados(): void {
    const startIndex = (this.paginaActual - 1) * this.registrosPorPagina;
    const endIndex = startIndex + this.registrosPorPagina;
    this.registrosPaginados = this.registrosFiltrados.slice(
      startIndex,
      endIndex
    );
  }

  siguientePagina(): void {
    this.cancelarEdicion(null).then((cancelo) => {
      if (
        this.paginaActual * this.registrosPorPagina <
          this.registrosFiltrados.length &&
        cancelo
      ) {
        this.paginaActual++;
        this.actualizarRegistrosPaginados();
      }
    });
  }

  anteriorPagina(): void {
    this.cancelarEdicion(null).then((cancelo) => {
      if (this.paginaActual > 1 && cancelo) {
        this.paginaActual--;
        this.actualizarRegistrosPaginados();
      }
    });
  }

  isNextDisabled(): boolean {
    return this.paginaActual * this.registrosPorPagina >= this.registros.length;
  }

  isPreviousDisabled(): boolean {
    return this.paginaActual === 1;
  }

  abandonarRegistro(mensaje: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.snackbarService.showConfirmMessage(
        mensaje,
        'Sí',
        'No',
        () => {
          resolve(true); // Usuario confirma
        },
        () => {
          resolve(false); // Usuario cancela
        }
      );
    });
  }

  async cancelarEdicion(registro: Registro | null): Promise<boolean> {
    let cancelo = true;
    let mostrarMensaje = true;

    if (registro!==null)
      cancelo = await this.abandonarRegistro(
        '¿Estás seguro de que deseas perder los cambios no guardados?'
      );
    else {
      cancelo = false;
    }
    console.log('Cancelar es : ', cancelo, ' Registro:', registro);

    console.log('Registrso:', this.registros);
    console.log('Eliminados: ', this.registrosEliminados);
    console.log('filtrados:', this.registrosFiltrados);

    if (cancelo) {
      console.log('Deshaciendo');
      if (registro !== null && registro.id === 0) {
        console.log('deshaciendo el registro: ',registro.valor);
        this.registrosNuevos = this.registrosNuevos.filter(
          (p) => !(p.id === registro.id && p.valor === registro.valor)
        );
        this.registrosFiltrados = this.registrosFiltrados.filter(
          (p) => !(p.id === registro.id && p.valor === registro.valor)
        );
        this.registros = this.registros.filter(
          (p) => !(p.id === registro.id && p.valor === registro.valor)
        );


        let nuevos: Registro[];
        nuevos = this.registrosPaginados.filter(
          (p) => p.id === registro.id && p.valor === registro.valor
        );
        this.registrosPaginados = this.registrosPaginados.filter(
          (p) => !(p.id === registro.id && p.valor === registro.valor)
        );
        //console.log('Despues de cancelar: registros:',this.registrosPaginados.length, 'registros nuevos',this.registrosNuevos.length);
        if (this.registrosPaginados.length === 0) {
          this.adicionarNuevaFila(0);
        }
      }
    } else {
      cancelo = false;
    }

    if (registro===null)
        cancelo=true;

    console.log("Antes de salir de cancelar");
    console.log('Registrso:', this.registros);
    console.log('Eliminados: ', this.registrosEliminados);
    console.log('filtrados:', this.registrosFiltrados);

    return cancelo;
  }
  filtrarRegistros(): void {
    if (!this.terminoDeBusqueda) {
      this.registrosFiltrados = this.registros;
    } else {
      this.registrosFiltrados = this.registros.filter((registro) => {
        return Object.keys(registro).some((key) => {
          const value = registro[key as keyof Registro]; // Especificar tipo de `key`
          return (
            typeof value === 'string' &&
            value.toLowerCase().includes(this.terminoDeBusqueda.toLowerCase())
          );
        });
      });
    }
  }

  async ordenarTabla(columna: string): Promise<void> {
    const cancelo = await this.cancelarEdicion(null);
    console.log('Cancelo ordenando ', cancelo, ' columna:', columna);
    if (cancelo) {
      console.log("organizando ordenamiento por ",columna);
      if (this.ordenarColumna === columna) {
        this.ordenarDireccion = this.ordenarDireccion === '↑' ? '↓' : '↑';
      } else {
        this.ordenarColumna = columna;
        this.ordenarDireccion = '↑'; // Por defecto, empieza con ascendente
      }

      // Define columnas numéricas: ej: id, sueldo, etc.
      const numericColumns = ['id'];

      console.log("en el ordenamiento:");
      console.log("Registro filtrado:",this.registrosFiltrados);
      console.log("Registros:",this.registros);
      this.filtrarRegistros();
      // Ordena los registros
      this.registros.sort((a, b) => {
        console.log("Esta ordenando a:",a.valor, " vs ",b.valor)
        const aValue = numericColumns.includes(columna)
          ? Number(a[columna])
          : a[columna];
        const bValue = numericColumns.includes(columna)
          ? Number(b[columna])
          : b[columna];

        if (this.ordenarDireccion === '↑') {
          return aValue > bValue ? 1 : -1; // Orden ascendente
        } else {
          return aValue < bValue ? 1 : -1; // Orden descendente
        }
      });
      this.registros = [...this.registros];
      this.registrosFiltrados = [...this.registrosFiltrados];
      this.registrosPaginados = [...this.registrosPaginados];

      this.actualizarRegistrosPaginados();

      this.cdr.detectChanges(); // Forzar la actualización en el DOM

    } else {
      console.log('no ordeno nada');
    }
  }
  //Developer: Método para actualizar el registro, se llama desde el html
  cambioDeDato(registro: Registro): void {
    //Developer: Aquí se llama al método de actualización en el servicio para persistir posteriormente el cambio
    this.actualizarRegistro(registro);
  }
  actualizarRegistro(registro: Registro) {
    registro.id = parseInt((registro.id ?? '0').toString());
    const existing = this.registrosModificados.find(
      (p) => p.id === registro.id
    );
    if (!existing && registro.id !== 0) {
      this.registrosModificados.push({ ...registro }); // Copia para evitar referencias
    } else if (existing) {
      Object.assign(existing, registro); // Actualiza el existente
    }
  }

  //Developer: Método para agregar un nuevo registro, se debe ajustar de acuerdo a la estructura del registro
  adicionarNuevaFila(i: number): void {
    const nuevoRegistro: Registro = {
      id: 0,
      id_tabla_valor: this.maestraId,
      valor: '',
      estado: 'A',
      descripcion: '',
      fecha_creacion: null,
      fecha_modificacion: null,
      id_usuario: null,
      id_usuario_modificacion: null,
    };
    this.registrosNuevos.push(nuevoRegistro);
    this.registros.push(nuevoRegistro);

    this.registrosPaginados.splice(i + 1, 0, nuevoRegistro);
    this.registrosPaginados = [...this.registrosPaginados]; // Reasignar el arreglo
    this.actualizarRegistrosPaginados;
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  elementosPorCambioDePagina(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; // Asegúrate de que sea un HTMLSelectElement
    const newItemsPerPage = Number(selectElement.value); // Convierte el valor a número
    this.registrosPorPagina = newItemsPerPage;
    this.paginaActual = 1; // Reiniciar a la primera página
    this.actualizarRegistrosPaginados();
  }

  formatearFecha(dateString: string): string {
    const timestamp = Number(dateString);
    if (isNaN(timestamp)) {
      return 'Fecha inválida'; // Manejo de error
    }
    const date = new Date(timestamp);

    // Obtener los componentes de la fecha
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexado
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Formatear la fecha en el formato deseado
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }
  async eliminarRegistro(registro: Registro): Promise<void> {
    //Developer: Se debe buscar el registro en el arreglo de nuevos, usando lo equivalente a la llave única (no la llave primaria)
    const eliminar = await this.abandonarRegistro(
      '¿Estás seguro de que deseas eliminar el registro?'
    );

    if (eliminar) {
      if (
        this.registrosNuevos.some(
          (p) => p.id === registro.id && p.valor === registro.valor
        )
      ) {
        this.registrosNuevos = this.registrosNuevos.filter(
          (p) => !(p.id === registro.id && p.valor === registro.valor)
        );
      } else {
        this.registrosEliminados.push(registro);
        this.registrosPaginados = this.registrosPaginados.filter(
          (p) => !(p.id === registro.id && p.valor === registro.valor)
        );
      }

      console.log(
        'antes de filtrar:',
        registro.valor,
        ' En eliminados: ',
        this.registrosFiltrados
      );
      //Developer: Se debe buscar el registro en el arreglo de nuevos, usando lo equivalente a la llave única (no la llave primaria)
      this.registros = this.registros.filter(
        (p) => !(p.id === registro.id && p.valor === registro.valor)
      );
      this.registrosFiltrados = this.registrosFiltrados.filter(
        (p) => !(p.id === registro.id && p.valor === registro.valor)
      );
      console.log('En eliminados: ', this.registrosFiltrados);
      //Developer: Se debe buscar el registro en el arreglo de modificados, usando lo equivalente a la llave única (no la llave primaria)
      this.registrosModificados = this.registrosModificados.filter(
        (p) => !(p.id === registro.id && p.valor === registro.valor)
      );
    }
  }

  irAPrimeraPagina(): void {
    if (this.paginaActual !== 1) {
      this.paginaActual = 1;
      this.actualizarRegistrosPaginados();
    }
  }
  irAUltimaPagina(): void {
    const totalPaginas = Math.ceil(
      this.registros.length / this.registrosPorPagina
    );
    if (this.paginaActual !== totalPaginas) {
      this.paginaActual = totalPaginas;
      this.actualizarRegistrosPaginados();
    }
  }
  getTotalPaginas(): number {
    return Math.ceil(this.registros.length / this.registrosPorPagina);
  }

  /*****************Para enviar a la Maestra************ */

  //Developer: Se debe ajustar el nombre de la variable de salida de acuerdo al detalle
  @Output() tablasValoresItemsEmitidos = new EventEmitter<{
    nuevos: Registro[];
    modificados: Registro[];
    eliminados: Registro[];
  }>();

  //Developer: Se utiliza para enviar al componente maestro los registros nuevos, modificados y eliminados
  emitirRegistros() {
    this.tablasValoresItemsEmitidos.emit({
      nuevos: this.registrosNuevos,
      modificados: this.registrosModificados,
      eliminados: this.registrosEliminados,
    });
  }

  /****************************************************** */

  /*********************Recibiendod de la maestra******** */

  validarAntesDeGuardar(): boolean {
    let esValido = true;

    //Developer: Verificar registros nuevos
    this.registrosNuevos.forEach((registro, index) => {
      //Developer: Se deben validar todos los campos obligatorios
      if (!registro.valor || registro.valor.trim() === '') {
        esValido = false;
        this.resaltarCampoInvalido(index);
      }
    });

    //Developer: Verificar registros modificados
    this.registrosModificados.forEach((registro, index) => {
      //Developer: Se deben validar todos los campos obligatorios
      if (!registro.valor || registro.valor.trim() === '') {
        esValido = false;
        this.resaltarCampoInvalido(index);
      }
    });

    if (!esValido) {
      console.warn('Hay campos sin completar en el detalle.');
    }
    return esValido;
  }

  private resaltarCampoInvalido(index: number) {
    setTimeout(() => {
      const elementos = document.querySelectorAll('.input-valor');
      if (elementos[index]) {
        (elementos[index] as HTMLElement).classList.add('campo-novalido ');
      }
    });
  }

  actualizarNuevosId(nuevosIds: { id: number; valor: string }[]) {
    // Recorremos el array nuevosIds
    nuevosIds.forEach((nuevoId) => {
      // Buscamos en registrosPaginados
      this.registrosPaginados.forEach((registro) => {
        //Developer: Se debe ajustar el campo que se va a comparar (los de la llave unica)
        if (registro.id === 0 && registro.valor === nuevoId.valor) {
          registro.id = nuevoId.id; // Actualizamos el ID
        }
      });

      // Buscamos en registros
      this.registros.forEach((registro) => {
        //Developer: Se debe ajustar el campo que se va a comparar (los de la llave unica)
        if (registro.id === 0 && registro.valor === nuevoId.valor) {
          registro.id = nuevoId.id; // Actualizamos el ID
        }
      });
    });

    console.log(
      'Registros actualizados - registrosPaginados:',
      this.registrosPaginados
    );
    console.log('Registros actualizados - registros:', this.registros);
  }

  /********************************************************/
}
