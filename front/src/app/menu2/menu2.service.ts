import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Menu2Service {
  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) {}
  getMenu(): Observable<any> {
    //Developer: Se consulta toda la informacióno de la tabla. Si la tabla contiene miles de registros,
    //Se debe replantear la consulta y hacerla por partes
    //La consulta se configura de acuerdo a la estructura definida en el backend para el detalle
    const query = `
        query     {
          getUserMenu {
            menu {
              label
              children {
                label
                route
              }
            }
          }
        }
      `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl, { query }, { headers });
  }
}
