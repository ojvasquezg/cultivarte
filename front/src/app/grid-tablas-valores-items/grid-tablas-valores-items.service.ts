import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class GridTablasValoresItemsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  cargarRegistros(maestraId: number): Observable<any> {

    //Developer: Recibe el id de la maestra
    //La consulta se configura de acuerdo a la estructura definida en el backend para el detalle

    const query = `
      query {
        listTablasValoresItems (maestraId:${maestraId}) {
          id
          id_tabla_valor
          valor
          estado
          descripcion
          fecha_creacion
          fecha_modificacion
          id_usuario
          id_usuario_modificacion
        }
      }
    `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl, { query }, { headers });
  }

}
