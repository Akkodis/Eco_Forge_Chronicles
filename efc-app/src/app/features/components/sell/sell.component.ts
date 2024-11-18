import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletService } from 'src/app/shared/services/web3/base-services/wallet.service';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.css',
})
export class SellComponent {
  readonly #walletService = inject(WalletService);
  public isConnected = toSignal(this.#walletService.connected$);

  sellListing!: boolean;
  listAllItems!: boolean;
  confirmationListedItems!: boolean;
  successListing!: boolean;
  walletClosed: boolean = true;
  showWalletDialog: boolean = true;
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  onSellListing() {
    this.sellListing = true;
    this.listAllItems = true;
  }

  onConfirmationItems() {
    this.sellListing = false;
    this.cdr.detectChanges();

    requestAnimationFrame(() => {
      this.successListing = true;
      this.confirmationListedItems = false;
      this.cdr.detectChanges();
    });
  }
  onListItems() {
    this.listAllItems = false;
    this.confirmationListedItems = true;
  }

  onRefuseItems() {
    this.listAllItems = true;
    this.confirmationListedItems = false;
  }

  onClose() {
    this.successListing = false;
    this.sellListing = false;
    this.walletClosed = false;
    this.showWalletDialog = false;
  }
}
