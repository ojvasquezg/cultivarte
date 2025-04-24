import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  showError(message: string, action: string = 'Cerrar') {
    this.snackBar.open(message, action, {
      duration: 5000, // Duración de 5 segundos
      panelClass: 'error-snackbar', // Clase personalizada para estilos
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  showSuccess(message: string, action: string = 'Cerrar') {
    this.snackBar.open(message, action, {
      duration: 5000, // Duración de 3 segundos
      panelClass: ['success-snackbar'], // Clase personalizada para estilos de éxito
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

}
