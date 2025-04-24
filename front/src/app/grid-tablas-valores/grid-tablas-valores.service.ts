import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GridTablasValoresService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  cargarRegistros(): Observable<any> {

    //Developer: Se consulta toda la informacióno de la tabla. Si la tabla contiene miles de registros,
    //Se debe replantear la consulta y hacerla por partes
    //La consulta se configura de acuerdo a la estructura definida en el backend para el detalle
    const query = `query {
        listTablasValores {
          id
          nombre
          usuario
          modulo
        }
      }
      `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl, { query }, { headers });
  }

}
