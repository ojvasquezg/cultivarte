import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class GridEventosSesionesParticipantesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  cargarListaBeneficiarios() {
    const query = {
      query: `
        query {
            listBeneficiarios {

                beneficiarios{
              id
              valor}
            }
        }
      `,
    };

    return this.http.post<any>(this.apiUrl, query);
  }


  cargarRegistros(maestraId: number): Observable<any> {

    //Developer: Recibe el id de la maestra
    //La consulta se configura de acuerdo a la estructura definida en el backend para el detalle

    const query = `
      query {
        listParticipantesSesiones(evento_sesiones_id: ${maestraId})
            {
              id
              evento_sesiones_id
              id_participante

            }
      }
    `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl, { query }, { headers });
  }

}
