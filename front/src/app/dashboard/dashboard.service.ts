import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http:HttpClient) { }

  obtenerUsuario(): Observable<string> {
    const query = {
      query: `{
        obtenerUsuario
      }`
    };

    return this.http.post<{ data: { obtenerUsuario: string } }>(this.apiUrl, query)
      .pipe(
        map(response => response.data.obtenerUsuario) // Extraer solo el resultado
      );
  }

}
