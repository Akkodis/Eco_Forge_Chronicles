import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogComponent } from '../dialog/dialog.component';
import { Asset } from 'src/app/shared/models/assets-data';

@Component({
  selector: 'app-assets-dialog',
  templateUrl: './assets-dialog.component.html',
  styleUrl: './assets-dialog.component.css',
})
export class AssetsDialogComponent extends DialogComponent {
  @Input()
  listItems!: boolean;

  @Input()
  confirmationItems!: boolean;

  @Output()
  listItemsAction = new EventEmitter<void>();

  @Output()
  confirmationItemsAction = new EventEmitter<void>();

  @Output()
  refuseItemsAction = new EventEmitter<void>();

  @Output() onCloseDialog = new EventEmitter<void>();

  waitingForConfirmation!: boolean;

  characters: Asset[] = [
    {
      asset: 'Mynod',
      amount: 42,
      rarity: 1,
      age: 2216,
      element: 'nature',
      type: 'Gaming Card',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Figment',
      amount: 187,
      rarity: 2,
      age: 0,
      element: 'dark',
      type: '-',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Oben',
      amount: 1,
      rarity: 3,
      age: 4554,
      element: 'spirit',
      type: 'Hero Card',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Mynod',
      amount: 42,
      rarity: 1,
      age: 2216,
      element: 'nature',
      type: 'Gaming Card',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Figment',
      amount: 187,
      rarity: 2,
      age: 0,
      element: 'dark',
      type: '-',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Oben',
      amount: 1,
      rarity: 3,
      age: 4554,
      element: 'spirit',
      type: 'Hero Card',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Mynod',
      amount: 42,
      rarity: 1,
      age: 2216,
      element: 'nature',
      type: 'Gaming Card',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Figment',
      amount: 187,
      rarity: 2,
      age: 0,
      element: 'dark',
      type: '-',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Oben',
      amount: 1,
      rarity: 3,
      age: 4554,
      element: 'spirit',
      type: 'Hero Card',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Mynod',
      amount: 42,
      rarity: 1,
      age: 2216,
      element: 'nature',
      type: 'Gaming Card',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Figment',
      amount: 187,
      rarity: 2,
      age: 0,
      element: 'dark',
      type: '-',
      price: 790,
      totalAmount: 1580,
    },
    {
      asset: 'Oben',
      amount: 1,
      rarity: 3,
      age: 4554,
      element: 'spirit',
      type: 'Hero Card',
      price: 790,
      totalAmount: 1580,
    },
  ];

  characterKeys: (keyof Asset)[] = [
    'asset',
    'amount',
    'rarity',
    'age',
    'element',
    'type',
    'price',
    'totalAmount',
  ];

  headers = [
    'Asset',
    'Sell',
    'Rarity',
    'Age',
    'Element',
    'Type',
    'Price',
    'Amount',
  ];

  onListItems() {
    this.listItemsAction.emit();
  }

  onConfirmationItems() {
    this.waitingForConfirmation = true;
    this.confirmationItems = false;
  }

  onTransactionConfirmed() {
    this.confirmationItemsAction.emit();
  }

  onRefuseItems() {
    this.refuseItemsAction.emit();
  }

  handleDialogClosed() {
    this.onCloseDialog.emit();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.onCloseDialog.emit();
  }
}
