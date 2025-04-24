// src/app/services/error-message.service.ts
import { Injectable } from '@angular/core';
import ErrorMessages from '../messages/error-messages';
@Injectable({
  providedIn: 'root',
})
export class ErrorMessageService {
  getErrorMessage(code: string): string {
    console.log("Recorremos las claves de ErrorMessages")
    for (const key of Object.keys(ErrorMessages)) {
      if (code.includes(key)) {
        // Si el código contiene la clave, devolvemos el mensaje correspondiente
        return ErrorMessages[key];
      }
    }
    // Si no se encuentra ninguna coincidencia, devolvemos el mensaje genérico
    return 'Ha ocurrido un error desconocido.';
  }
}
