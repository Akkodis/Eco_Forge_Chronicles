import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletService } from '../../services/web3/base-services/wallet.service';

@Component({
  selector: 'app-connect-wallet-button',
  templateUrl: './connect-wallet-button.component.html',
  styleUrls: ['./connect-wallet-button.component.css'],
})
export class ConnectWalletButtonComponent {
  readonly #walletService = inject(WalletService);

  public isConnected = toSignal(this.#walletService.connected$);

  walletConnectBg: string = 'assets/images/slice-assets/walletConnect.png';
  walletDisconnectBg: string =
    'assets/images/slice-assets/walletDisconnect.png';

  public async openSignIn(): Promise<void> {
    await this.#walletService.signIn();
  }

  public async signOut(): Promise<void> {
    await this.#walletService.disconnectWallet();
  }
}
