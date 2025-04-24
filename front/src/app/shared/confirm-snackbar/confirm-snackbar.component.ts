import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-confirm-snackbar',
  templateUrl: './confirm-snackbar.component.html',
  styleUrls: ['./confirm-snackbar.component.css'],
  standalone:false
})
export class ConfirmSnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<ConfirmSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.snackBarRef.dismissWithAction();
  }

  onCancel(): void {
    this.snackBarRef.dismiss();
  }
}
