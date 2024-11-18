export interface ChainInfo {
  chainId: string;
  name: string;
  symbol: string;
  iconPath: string;
  rpcUrl: string;
  blockExplorerUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
