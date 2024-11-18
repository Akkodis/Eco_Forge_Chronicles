import { Component, Input } from '@angular/core';
import { Asset } from '../../models/assets-data';
import { appAttributes } from '../../config/application.config';

@Component({
  selector: 'app-asset-selection',
  templateUrl: './asset-selection.component.html',
  styleUrl: './asset-selection.component.css',
})
export class AssetSelectionComponent {
  @Input()
  selectedAsset: Asset | null = null;

  quantity = 30;
  price = 400;
  totalPrice = this.quantity * this.price;
  assetExpanded: boolean = true;
  currencyName = appAttributes.currencyName;
  currency = appAttributes.currency;
  currencyIcon = appAttributes.currencyIcon;
  assetListingDialog!: boolean;

  increaseQuantity() {
    if (this.quantity < 30) {
      this.quantity++;
      this.updateTotalPrice();
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateTotalPrice();
    }
  }

  increasePrice() {
    this.price += 1;
    this.updateTotalPrice();
  }

  decreasePrice() {
    if (this.price > 50) {
      this.price -= 1;
      this.updateTotalPrice();
    }
  }

  updateTotalPrice() {
    this.totalPrice = this.quantity * this.price;
  }

  onQuickSell() {}

  onAddToSellList() {
    this.assetListingDialog = true;
  }

  onClose() {
    this.assetListingDialog = false;
  }

  onConfirmation() {}
}
