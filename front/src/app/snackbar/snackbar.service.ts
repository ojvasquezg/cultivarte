import { Injectable } from '@angular/core'
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar'
import { ConfirmSnackbarComponent } from '../shared/confirm-snackbar/confirm-snackbar.component'

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) { }

  horizontalPosition: MatSnackBarHorizontalPosition = 'center'
  verticalPosition: MatSnackBarVerticalPosition = 'top'

  showConfirmMessage(
    message: string,
    confirmText: string = 'Sí',
    cancelText: string = 'No',
    onConfirm: () => void,
    onCancel?: () => void
  ) {
    const snackBarRef = this.snackBar.openFromComponent(
      ConfirmSnackbarComponent,
      {
        data: { message, confirmText, cancelText },
        duration: 155000,
        panelClass: ['custom-snackbar'],
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition
      }
    )

    snackBarRef.afterDismissed().subscribe(info => {
      if (info.dismissedByAction) {
        onConfirm()
      } else if (onCancel) {
        onCancel()
      }
    })
  }

  confirmWithSnackbar(
    mensaje: string,
    confirmText: string = 'Sí',
    cancelText: string = 'No'
  ): Promise<boolean> {
    return new Promise(resolve => {
      this.showConfirmMessage(
        mensaje,
        confirmText,
        cancelText,
        () => {
          resolve(true) // Usuario confirma
        },
        () => {
          resolve(false) // Usuario cancela
        }
      )
    })
  }
}
