import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmSnackbarComponent } from '../shared/confirm-snackbar/confirm-snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  showConfirmMessage(
    message: string,
    confirmText: string = 'Sí',
    cancelText: string = 'No',
    onConfirm: () => void,
    onCancel?: () => void
  ) {
    const snackBarRef = this.snackBar.openFromComponent(ConfirmSnackbarComponent, {
      data: { message, confirmText, cancelText },
      duration: 5000,
      panelClass: ['custom-snackbar'],
    });

    snackBarRef.afterDismissed().subscribe((info) => {
      if (info.dismissedByAction) {
        onConfirm();
      } else if (onCancel) {
        onCancel();
      }
    });
  }
}
