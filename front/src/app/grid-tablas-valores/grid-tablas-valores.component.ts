import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';

//Developer: Cambiar por la interface del registro correspondiente
import { GridTablasValores } from '../models/grid-tablas-valores.interface';

import { GridTablasValoresService } from './grid-tablas-valores.service';

//Developer: Cambiar por la interface del registro correspondiente
type Registro = GridTablasValores;

@Component({
  selector: 'app-grid-tablas-valores',
  standalone: false,
  templateUrl: './grid-tablas-valores.component.html',
  styleUrl: '../css/styles.css',
})
export class GridTablasValoresComponent {
  //Variables estandar
  registros: any[] = []; // Aquí se almacenarán los productos
  registrosFiltrados: any[] = [];
  terminoDeBusqueda: string = ''; // Almacena el término de búsqueda
  paginaActual: number = 1; // Página actual
  registrosPorPagina: number = 5; // Elementos por página
  registrosPaginados: any[] = []; // Registro para mostrar en la pagina actual
  nroRegistrosPorPagina: number[] = [5, 10, 20, 30]; // Opciones para elementos por página
  ordenarColumna: string = ''; // Columna que se está ordenando
  ordenarDireccion: string = ''; // Dirección de ordenamiento (ascendente o descendente)
  editIndex: number | null = null; // Índice de la fila que está en modo edición

  constructor(
    private gridTablasValoresService: GridTablasValoresService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargaRegistros();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  cargaRegistros() {
    //Developer: Cambiar por el servicio correspondiente
    this.gridTablasValoresService.cargarRegistros().subscribe(
      (response) => {
        this.registros = response.data.listTablasValores.map(
          (registro: Registro) => ({
            ...registro,
          })
        );

        this.registrosFiltrados = this.registros;

        this.actualizarRegistrosPaginados();
      },
      (error) => {
        console.error('Error fetching products:', error);
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
    if (
      this.paginaActual * this.registrosPorPagina <
      this.registrosFiltrados.length
    ) {
      this.paginaActual++;
      this.actualizarRegistrosPaginados();
    }
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarRegistrosPaginados();
    }
  }

  isNextDisabled(): boolean {
    return (
      this.paginaActual * this.registrosPorPagina >=
      this.registrosFiltrados.length
    );
  }

  isPreviousDisabled(): boolean {
    return this.paginaActual === 1;
  }

  ordenarTabla(columna: string): void {
    // Cambia la dirección del ordenamiento

    if (this.ordenarColumna === columna) {
      this.ordenarDireccion = this.ordenarDireccion === '↑' ? '↓' : '↑';
    } else {
      this.ordenarColumna = columna;
      this.ordenarDireccion = '↑'; // Por defecto, empieza con ascendente
    }

    // Define columnas numéricas, sueldo, edad, etc
    const numericColumns = ['id'];

    // Ordena los registros, ajustando para ordenar numéricamente si es una columna numérica
    this.registros.sort((a, b) => {
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

    this.actualizarRegistrosPaginados(); // Actualiza los products paginados
  }

  elementosPorCambioDePagina(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    this.registrosPorPagina = newItemsPerPage;
    this.paginaActual = 1;
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
    return Math.ceil(this.registrosFiltrados.length / this.registrosPorPagina);
  }

  irACrud(id: number) {
    //Developer:Cambiar por la ruta correspondiente al Formulario CRUD
    this.router.navigate(['/dashboard/form-tablas-valores', id]);
  }


    //Developer: Este metodo aplica para campos String, Numericos y Fechas. Otro tipo de dato se debe implementar
    filtrarRegistros(): void {
      if (!this.terminoDeBusqueda) {
        console.log("No hay término de búsqueda");
        this.registrosFiltrados = this.registros;
      } else {
        this.registrosFiltrados = this.registros.filter((registro) => {
          return Object.keys(registro).some((key) => {
            const value = registro[key as keyof Registro];

            // Si es una fecha en formato timestamp, la convertimos
            const formattedDate = typeof value === 'string' && !isNaN(Number(value))
              ? this.formatearFecha(value)
              : '';

            return (
              (typeof value === 'string' && value.toLowerCase().includes(this.terminoDeBusqueda.toLowerCase())) ||
              (typeof value === 'number' && value.toString().includes(this.terminoDeBusqueda)) ||
              (formattedDate.includes(this.terminoDeBusqueda)) // Comparar fechas formateadas
            );
          });
        });
      }
    }
}
