import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProgramacionEventosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSesionesEventos() {
    const query = {
      query: `
        query {
          listSesiones {
            id_sesion
            nombre_sesion
            id_nombre_evento
            desde
            hasta
            eje_tematico
            tipo_evento
            ubicacion
            id_eje_tematico
            id_tipo_evento
            id_ubicacion
            descripcion_grupo
            aliado
            id_responsable
            no_atencion
            motivo_no_atencion
            desde_no_atencion
            hasta_no_atencion
            es_institucional
          }
        }
      `,
    };

    return this.http.post<any>(this.apiUrl, query);
  }

  getParametros() {
    const query = {
      query: `
        query {
              listParametros {
                beneficiarios{
                id
  	            valor}
              ejesTematicos{
                id
                valor}
              tiposEventos{
                id
                valor}
              ubicaciones{
                id
                valor}
              nombresEventos{
                id
                valor}
              responsables {
                id
                valor}
              }

            }
      `,
    };

    return this.http.post<any>(this.apiUrl, query);
  }

  guardarEvento(
    maestra: any,
    detalle: {
      sesiones: any[];
      participantesNuevos: any[];
      participantesModificados: any[];
      participantesEliminados: any[];
    }
  ): Observable<any> {
    // Convertir fechas de sesiones a formato local sin la Z
    const toLocalISOString = (date: Date) => {
      const offsetMs = date.getTimezoneOffset() * 60 * 1000;
      const localTime = new Date(date.getTime() - offsetMs);
      return localTime.toISOString().slice(0, 16); // Ej: "2025-05-26T07:00"
    };

    // Formatear fechas de las sesiones
    const sesionesFormateadas = detalle.sesiones.map((s) => ({
      ...s,
      desde: toLocalISOString(new Date(s.desde)),
      hasta: toLocalISOString(new Date(s.hasta)),
    }));
    console.log("Sesiones formateadas", sesionesFormateadas);
    //Developer: Recibe el maestro y los detalles
    //Usa 0 si deseas insertar un nuevo registro, o un ID existente para actualizar
    //La mutacion se configura de acuerdo a la estructura definida en el backend
    const mutation = `
        mutation {
            insupdEventos(
            maestra: {  id:  ${maestra.idSesion},
                      id_eje_tematico:  ${maestra.idEjeTematico},
                      id_tipo_evento:  ${maestra.idTipoEvento},
                      id_ubicacion:  ${maestra.idUbicacion},
                      id_responsable:  ${maestra.idResponsable},
                      id_nombre_evento:  ${maestra.idNombreEvento},
                      aliado:  "${maestra.aliado}",
                      descripcion_grupo:  "${maestra.descripcionGrupo}",
                      no_atencion:  ${maestra.noAtencion},
                      motivo_no_atencion:  "${maestra.motivoNoAtencion}",
                      desde_no_atencion:  ${maestra.desdeNoAtencion},
                      hasta_no_atencion:  ${maestra.hastaNoAtencion},
                      es_institucional:  ${maestra.esInstitucional}
                      },
              eventosSesiones: ${JSON.stringify(sesionesFormateadas).replace(
                /"([^"]+)":/g,
                '$1:'
              )},
              newEventosSesionesParticipantes: ${JSON.stringify(
                detalle.participantesNuevos
              ).replace(/"([^"]+)":/g, '$1:')},
              delEventosSesionesParticipantes: ${JSON.stringify(
                detalle.participantesEliminados
              ).replace(/"([^"]+)":/g, '$1:')}
            ) {
            respuesta
            mensaje
          }
        }
         `;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl, { query: mutation }, { headers });
  }
}
