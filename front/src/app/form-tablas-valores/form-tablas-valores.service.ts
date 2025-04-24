import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TablasValores } from '../models/tablas-valores.interface';
import { TablasValoresItems } from '../models/tablas-valores-items.interface';
import { environment } from '../../environments/environment';

interface Modulo {
  id: number;
  nombre: string;
}
interface Response {
  respuesta: boolean;
  mensaje: string;
  data: TablasValores; // Developer: Use the interface Maestra
}
@Injectable({
  providedIn: 'root',
})
export class FormTablasValoresService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  loadModulos(): Observable<Modulo[]> {
    const query = {
      query: `
        {
          listModulos {
            id
            nombre
          }
        }
      `,
    };

    return this.http
      .post<{ data: { listModulos: Modulo[] } }>(this.apiUrl, query)
      .pipe(map((response) => response.data.listModulos));
  }

  guardar(
    maestra: any,
    detalle: {
      nuevos: TablasValoresItems[];
      modificados: TablasValoresItems[];
      eliminados: TablasValoresItems[];
    }
  ): Observable<any> {
    //Developer: Recibe el maestro y los detalles
    //Usa 0 si deseas insertar un nuevo registro, o un ID existente para actualizar
    //La mutacion se configura de acuerdo a la estructura definida en el backend
    const mutation = `
        mutation {
            insupdTablasValores(
            maestra: {
              id: ${maestra.id},
              nombre:  "${maestra.nombre}",
              id_usuario: ${maestra.id_usuario},
              id_modulo: ${maestra.id_modulo}
            },
              newTablasValoresItems: ${JSON.stringify(detalle.nuevos).replace(
                /"([^"]+)":/g,
                '$1:'
              )},
              updTablasValoresItems: ${JSON.stringify(
                detalle.modificados
              ).replace(/"([^"]+)":/g, '$1:')},
              delTablasValoresItems: ${JSON.stringify(
                detalle.eliminados
              ).replace(/"([^"]+)":/g, '$1:')}
            ) {
              respuesta
              mensaje
              data {
                id
                nombre
                id_usuario
                fecha_creacion
                fecha_modificacion
                id_modulo
                usuario
                usuario_modificacion
              },
              nuevosIds{
                id
                valor
              }

            }
          }
         `;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl, { query: mutation }, { headers });
  }

  consultaPorId(id: number): Observable<Response> {
    //Developer: Se configura el querie para traer la informacion de la maestra por ID
    const query = {
      query: `{
            tablasValoresPorId(id: ${id}) {
              respuesta
              mensaje
              data {
                id
                nombre
                id_usuario
                id_usuario_modificacion
                fecha_creacion
                fecha_modificacion
                id_modulo,
                usuario,
                usuario_modificacion
              }

            }
      }
        `,
      variables: { id },
    };

    return this.http
      .post<{ data: { tablasValoresPorId: Response } }>(this.apiUrl, query)
      .pipe(
        map((response) => {
          const resultado = response.data.tablasValoresPorId;
          return resultado;
        })
      );
  }

  eliminarRegistro(id: number): Observable<any> {
    //Developer: Recibe el id de la maestra
    //La mutacion se configura de acuerdo a la estructura definida en el backend
    const mutation = `mutation {
      deleteTablasValores( id: ${id}) {
        respuesta
        mensaje
      }
    }`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl, { query: mutation }, { headers });
  }
}
