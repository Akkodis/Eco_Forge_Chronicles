import { Injectable, inject } from '@angular/core';
import Onboard from '@web3-onboard/core';
import { ThemingMap } from '@web3-onboard/core/dist/types';
import { BehaviorSubject, Subject } from 'rxjs';
import injectedModule, { ProviderLabel } from '@web3-onboard/injected-wallets';
import { ChainInfo } from '../../../models/chain-info';
import { environment } from '../../../../../environments/environment';
import { SessionStorageService } from '../../session-storage.service';
import { ethers } from 'ethers/lib';
import {
  customTheme,
  walletAppMetadata,
  selectingWallet,
} from 'src/app/shared/config/application.config';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  public status$ = new BehaviorSubject<string>('');

  public connecting$ = new BehaviorSubject<boolean>(false);
  public connected$ = new BehaviorSubject<boolean>(false);

  public correctNetwork$ = new BehaviorSubject<boolean>(false);
  public networkSwitching$ = new BehaviorSubject<boolean>(false);
  public currentChain$ = new BehaviorSubject<ChainInfo | undefined>(undefined);
  public targetChain$ = new BehaviorSubject<ChainInfo | undefined>(undefined);

  public signerChanged$ = new Subject<any>();
  public reconnecting$ = new BehaviorSubject<boolean>(false);

  private readonly sessionStorageService = inject(SessionStorageService);

  private customTheme: ThemingMap = {
    '--w3o-background-color': customTheme['--w3o-background-color'],
    '--w3o-foreground-color': customTheme['--w3o-foreground-color'],
    '--w3o-text-color': customTheme['--w3o-text-color'],
    '--w3o-border-color': customTheme['--w3o-border-color'],
    '--w3o-action-color': customTheme['--w3o-action-color'],
    '--w3o-border-radius': customTheme['--w3o-border-radius'],
  };

  #currentChainId: string | null = null;
  #lastConnectedWalletAddress: string | null = null;
  #preferredWallets = [
    'MetaMask',
    'Trust Wallet',
    'SafePal',
    'Coinbase Wallet',
  ];

  private injected = injectedModule({
    filter: {
      [ProviderLabel.Phantom]: false,
      [ProviderLabel.Rainbow]: false,
    },
    displayUnavailable: this.#preferredWallets,
  });

  private onboard = Onboard({
    theme: this.customTheme,
    wallets: [this.injected],
    chains: [
      {
        id: environment.supportedNetworks.iotaEVM.chainID,
        token: environment.supportedNetworks.iotaEVM.nativeCurrency.symbol,
        label: environment.supportedNetworks.iotaEVM.chainName,
        rpcUrl: environment.supportedNetworks.iotaEVM.rpcUrls[0],
      },
    ],
    appMetadata: {
      name: walletAppMetadata.name,
      icon: walletAppMetadata.icon,
      description: walletAppMetadata.description,
      agreement: {
        version: walletAppMetadata.agreement.version,
        privacyUrl: walletAppMetadata.agreement.privacyUrl,
      },
    },
    i18n: {
      en: {
        connect: {
          selectingWallet: {
            header: selectingWallet.header,
            sidebar: {
              heading: selectingWallet.sidebar.heading,
              subheading: selectingWallet.sidebar.subheading,
              paragraph: selectingWallet.sidebar.paragraph,
            },
          },
        },
      },
    },
    accountCenter: {
      desktop: {
        enabled: false,
      },
      mobile: {
        enabled: true,
      },
    },
  });

  private readonly reconnectTimeoutMs = walletAppMetadata.reconnectTimeoutMs;

  constructor() {
    this.initListener();
    this.restoreWalletConnectionIfPossible();
  }

  private initListener(): void {
    console.log('Initializing listener');

    this.onboard.state.select('wallets').subscribe(async wallets => {
      if (wallets.length > 0) {
        const currentWalletAddress = wallets[0].accounts[0].address;

        if (
          this.#lastConnectedWalletAddress &&
          this.#lastConnectedWalletAddress !== currentWalletAddress
        ) {
          console.log('Account has changed');
          this.resetConnection();
        }

        this.#lastConnectedWalletAddress = currentWalletAddress;

        const provider = this.getProvider();
        if (provider) {
          const signer = provider.getSigner();
          this.signerChanged$.next(signer);

          const network = await provider.getNetwork();
          this.#currentChainId = `0x${network.chainId.toString(16)}`;
          const isCorrectNetwork = await this.isCorrectNetwork();
          this.correctNetwork$.next(isCorrectNetwork);
        }
      } else {
        this.#lastConnectedWalletAddress = null;
        this.connected$.next(false);
      }
    });
  }

  public async restoreWalletConnectionIfPossible(): Promise<boolean> {
    try {
      this.reconnecting$.next(true);
      const storedWalletLabel =
        this.sessionStorageService.get('connectedWallet');
      if (storedWalletLabel) {
        const maxWait = new Promise<null>(resolve => {
          setTimeout(() => {
            console.log('Reconnect max wait reached');
            resolve(null);
          }, this.reconnectTimeoutMs);
        });

        try {
          console.log('Reconnecting...');
          const wallets = await Promise.race([
            maxWait,
            this.onboard.connectWallet({
              autoSelect: {
                label: storedWalletLabel,
                disableModals: true,
              },
            }),
          ]);

          if (wallets != null && wallets.length > 0) {
            console.log('Reconnect successful');
            this.connected$.next(true);
            this.reconnecting$.next(false);
            await this.updateCurrentChain();
            return true;
          }
        } catch (error) {
          console.error('Error when reconnecting the wallet:', error);
        }

        console.log('Reconnect failed');
        await this.connectWallet();
      } else {
        await this.disconnectWallet();
      }

      this.reconnecting$.next(false);
      return false;
    } catch (error) {
      console.error('Error when checking if user is connected:', error);
      return false;
    }
  }

  private async connectWallet(): Promise<boolean> {
    try {
      const wallets = await this.onboard.connectWallet();
      if (wallets.length > 0) {
        this.connected$.next(true);

        this.sessionStorageService.set('connectedWallet', wallets[0].label);

        const provider = new ethers.providers.Web3Provider(wallets[0].provider);
        const signer = provider.getSigner();
        this.signerChanged$.next(signer);

        await this.updateCurrentChain();
        return true;
      }
    } catch (error) {
      console.error('Error when connecting the wallet:', error);
    }

    return false;
  }

  private async updateCurrentChain(): Promise<void> {
    const currentChainId = this.getCurrentChainId();
    if (currentChainId) {
      const currentChain = this.getChainById(currentChainId);
      this.currentChain$.next(currentChain);
    }
  }

  public async signIn(): Promise<boolean> {
    try {
      this.connecting$.next(true);
      await this.connectWallet();

      await this.addNetworkIfNotExists(
        environment.supportedNetworks.iotaEVM.chainID
      );

      if (!(await this.isCorrectNetwork())) {
        this.status$.next('Requested network switch');
        await this.changeNetworkToIotaEVM();
        if (!(await this.isCorrectNetwork())) {
          this.correctNetwork$.next(false);
          await this.disconnectWallet();
          return false;
        }
      }

      this.correctNetwork$.next(true);
      return true;
    } catch (error) {
      console.error('SignIn error:', error);
      await this.disconnectWallet();
      return false;
    } finally {
      this.connecting$.next(false);
    }
  }

  public async disconnectWallet(): Promise<void> {
    try {
      this.connected$.next(false);
      this.reconnecting$.next(false);
      this.status$.next('');
      this.networkSwitching$.next(false);

      this.sessionStorageService.remove('connectedWallet');

      const currentWalletState = this.onboard.state.get();
      if (currentWalletState.wallets.length > 0) {
        await this.onboard.disconnectWallet({
          label: currentWalletState.wallets[0].label,
        });
      }
    } catch (error) {
      console.error('Error when disconnecting the wallet:', error);
    }
  }

  private resetConnection(): void {
    console.log('Resetting connection state');
    this.connected$.next(false);
    this.status$.next('');
    this.currentChain$.next(undefined);
    this.targetChain$.next(undefined);
    this.correctNetwork$.next(false);
  }

  public async ensureConnected(requiredChainId: string): Promise<void> {
    if (!this.connected$.getValue()) {
      await this.signIn();
    }
    if (!this.connected$.getValue()) {
      throw new Error('Not connected to a wallet - Please connect a wallet');
    }

    const currentChainId = this.getCurrentChainId();
    if (currentChainId === null) {
      throw new Error(
        'Current network is not detected. Please connect to a network.'
      );
    }

    const currentChainName = this.getChainName(currentChainId);
    const requiredChainName = this.getChainName(requiredChainId);

    if (currentChainId !== requiredChainId) {
      const switched =
        await this.changeNetworkToSpecificChainId(requiredChainId);
      if (!switched) {
        throw new Error(
          `Incorrect network - You are currently on ${currentChainName}. Please switch to ${requiredChainName}.`
        );
      }
    }
  }

  public async reinitializeSigner(): Promise<void> {
    const walletState = this.onboard.state.get();
    if (walletState.wallets.length === 0) {
      throw new Error('No wallet connected.');
    }

    const primaryWallet = walletState.wallets[0];
    const provider = new ethers.providers.Web3Provider(primaryWallet.provider);
    const signer = provider.getSigner();
    this.signerChanged$.next(signer);
    console.log('Signer has been reinitialized.');
  }

  public async addNetworkIfNotExists(chainId: string): Promise<void> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('Ethereum provider is not available');
    }

    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId }]);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        const networkConfig = this.getChainById(chainId);
        if (!networkConfig) {
          console.error(
            'Network configuration not found for chainId:',
            chainId
          );
          return;
        }

        const params = [
          {
            chainId: networkConfig.chainId,
            chainName: networkConfig.name,
            nativeCurrency: networkConfig.nativeCurrency,
            rpcUrls: [networkConfig.rpcUrl],
            blockExplorerUrls: [networkConfig.blockExplorerUrl],
            iconUrls: [networkConfig.iconPath],
          },
        ];

        await provider.send('wallet_addEthereumChain', params);
      } else {
        throw switchError;
      }
    }
  }

  public async changeNetworkToSpecificChainId(
    chainId: string
  ): Promise<boolean> {
    this.networkSwitching$.next(true);
    const targetChain = this.getChainById(chainId);
    if (!targetChain) {
      console.error(`Chain ID ${chainId} not found.`);
      this.networkSwitching$.next(false);
      return false;
    }

    this.targetChain$.next(targetChain);
    const success = await this.onboard.setChain({
      chainId: targetChain.chainId,
    });
    if (success) {
      this.currentChain$.next(targetChain);
      this.correctNetwork$.next(true);
    } else {
      console.error(`Chain ID ${chainId} not supported or change failed.`);
    }
    this.networkSwitching$.next(false);
    return success;
  }

  public async changeNetworkToIotaEVM(): Promise<boolean> {
    const shimmerChainId = environment.supportedNetworks.iotaEVM.chainID;
    return this.changeNetworkToSpecificChainId(shimmerChainId);
  }

  public async isCorrectNetwork(): Promise<boolean> {
    try {
      const provider = this.getProvider();
      if (!provider) {
        throw new Error('Provider is not available');
      }
      const network = await provider.getNetwork();

      const networkChainIdHex = `0x${network.chainId.toString(16)}`;

      const networkConfig = Object.values(environment.supportedNetworks).find(
        config =>
          config.chainID.toUpperCase() === networkChainIdHex.toUpperCase()
      );

      return networkConfig !== undefined;
    } catch (error) {
      console.error('Error when checking the network:', error);
      return false;
    }
  }

  public getCurrentChainId(): string | null {
    return this.#currentChainId;
  }

  public async getAddress(): Promise<string> {
    const currentWalletState = this.onboard.state.get();
    if (currentWalletState.wallets.length) {
      const primaryWallet = currentWalletState.wallets[0];
      return primaryWallet.accounts[0].address;
    }
    throw new Error('No connected wallet found');
  }

  public getProvider(): ethers.providers.Web3Provider | null {
    const currentWalletState = this.onboard.state.get();
    if (currentWalletState.wallets.length) {
      const primaryWallet = currentWalletState.wallets[0];
      return new ethers.providers.Web3Provider(primaryWallet.provider);
    }
    return null;
  }

  public async getSigner(): Promise<ethers.Signer> {
    const provider = this.getProvider();
    if (provider) {
      return provider.getSigner();
    }
    throw new Error('Provider is not available');
  }

  public async getFeeData(): Promise<ethers.providers.FeeData> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('Provider is not available');
    }
    const feeData = await provider.getFeeData();
    if (
      !feeData.maxFeePerGas ||
      !feeData.maxPriorityFeePerGas ||
      !feeData.gasPrice ||
      !feeData.lastBaseFeePerGas
    ) {
      this.reinitializeSigner();
    }
    return provider.getFeeData();
  }

  private getChainName(chainId: string): string {
    return this.getChainById(chainId)?.name || 'Unknown Network';
  }

  public getChainById(chainId: string): ChainInfo | undefined {
    const chainConfig = Object.values(environment.supportedNetworks).find(
      config => config.chainID === chainId
    );
    if (!chainConfig) return undefined;
    return {
      chainId: chainConfig.chainID,
      name: chainConfig.chainName,
      symbol: chainConfig.nativeCurrency.symbol,
      iconPath: chainConfig.iconPath,
      rpcUrl: chainConfig.rpcUrls[0],
      blockExplorerUrl: chainConfig.explorerURL,
      nativeCurrency: {
        name: chainConfig.nativeCurrency.name,
        symbol: chainConfig.nativeCurrency.symbol,
        decimals: chainConfig.nativeCurrency.decimals,
      },
    };
  }

  //secret + timestamp, provide timestamp
  public async signMessage(message: string): Promise<string | undefined> {
    try {
      const currentWalletState = this.onboard.state.get();
      if (!currentWalletState.wallets.length) {
        throw new Error('No connected wallet found');
      }

      const primaryWallet = currentWalletState.wallets[0];

      const provider = new ethers.providers.Web3Provider(
        primaryWallet.provider
      );
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);

      return signature;
    } catch (error: any) {
      console.log(error);
      return undefined;
    }
  }

  public async addERC20TokenToWallet(
    tokenAddress: string,
    tokenSymbol: string,
    tokenDecimals: number,
    tokenImage?: string
  ): Promise<boolean> {
    try {
      const provider = this.getProvider();
      if (!provider) {
        throw new Error('Provider is not available');
      }

      const requestObject: any = {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage,
        },
      };

      const wasAdded = await provider.send('wallet_watchAsset', requestObject);

      return wasAdded;
    } catch (error) {
      console.error('Error when adding token to wallet:', error);
      return false;
    }
  }
}
