import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletService } from 'src/app/shared/services/web3/base-services/wallet.service';

@Component({
  selector: 'app-my-listings',
  templateUrl: './my-listings.component.html',
  styleUrl: './my-listings.component.css',
})
export class MyListingsComponent implements OnInit {
  readonly #walletService = inject(WalletService);
  public isConnected = toSignal(this.#walletService.connected$);

  ngOnInit() {}
}
