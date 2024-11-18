export const environment = {
  production: true,
  apiUrl: 'http://localhost:4200',
  supportedNetworks: {
    iotaEVM: {
      chainID: '0x433',
      chainName: 'IOTA EVM Testnet',
      nativeCurrency: {
        name: 'IOTA',
        symbol: 'IOTA',
        decimals: 18,
      },
      rpcUrls: ['https://json-rpc.evm.testnet.iotaledger.net/'],
      explorerURL: 'https://explorer.evm.testnet.iotaledger.net/',
      iconPath: '/assets/logos/iota-chain-logo.svg',
    },
  },
};
