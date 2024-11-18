import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogComponent } from '../dialog/dialog.component';
import { Asset } from 'src/app/shared/models/assets-data';

@Component({
  selector: 'app-listing-dialog',
  templateUrl: './listing-dialog.component.html',
  styleUrl: './listing-dialog.component.css',
})
export class ListingDialogComponent extends DialogComponent {
  @Input() quantity = 0;
  @Input() price = 0;
  @Input() currency = '';
  @Input() currencyIcon = '';
  @Input()
  asset: Asset | null = null;
  @Input() totalPrice = 0;
  @Output() confirmDialog = new EventEmitter<void>();
  protected assetImagePath = '/assets/images/assetPicture.png';
  protected claimIconPath = '/assets/images/icon-assets/Claim.png';

  @Output() onCloseDialog = new EventEmitter<void>();
  @Output() onConfirmationAction = new EventEmitter<void>();

  handleClose(): void {
    this.onCloseDialog.emit();
  }

  handleDialogClosed(): void {
    this.onCloseDialog.emit();
  }

  onConfirmation(): void {
    this.onConfirmationAction.emit();
  }
}
