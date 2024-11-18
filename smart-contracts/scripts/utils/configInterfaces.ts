export type ContractType = 'ERC20EcoBound' | 'ERC20Simple' | 'ERC721Redeemable' | 'ERC721Simple';

export type TokenUsage = 'Payment' | 'Asset' | 'Incentive';

export interface Trait {
    trait_type?: string;
    value: string | number;
    display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date' | string;
    max_value?: number;
}

export interface Metadata {
    description?: string;
    external_url?: string;
    image?: string;
    image_data?: string;
    name: string;
    attributes?: Trait[];
    background_color?: string;
    animation_url?: string;
    youtube_url?: string;
}

export interface ERC20DeployAndRegisterToken {
    name: string;
    symbol: string;
    tokenURI?: string;
    ecoBound: boolean;
    releasable?: boolean;
    maxSupply: string;
    triggersIncentive: boolean;
    contractType: ContractType;
    usage: TokenUsage;
    shouldMint?: boolean;
    generateMetadata?: boolean;
    metadata?: Metadata;
}

export interface ERC20RegisterOnlyToken {
    name: string;
    triggersIncentive: boolean;
    address: string;
    ecoBound?: boolean;
    contractType: ContractType;
    usage: TokenUsage;
    generateMetadata?: boolean;
    metadata?: Metadata;
}

export interface ERC721DeployAndRegisterToken {
    name: string;
    symbol: string;
    baseURI?: string;
    tokenURI?: string;
    contractType: ContractType;
    usage: TokenUsage;
    shouldMint?: boolean;
    generateMetadata?: boolean;
    metadata?: Metadata;
    totalSupply?: number;
}

export interface ERC721RegisterOnlyToken {
    name: string;
    address: string;
    ecoBound: boolean;
    contractType: ContractType;
    usage: TokenUsage;
    generateMetadata?: boolean;
    metadata?: Metadata;
    totalSupply?: number;
}

export interface ERC20TokensConfig {
    PaymentTokens: {
        deployAndRegister: ERC20DeployAndRegisterToken[];
        registerOnly: ERC20RegisterOnlyToken[];
    };
    SimpleTokens: {
        deployAndRegister: ERC20DeployAndRegisterToken[];
        registerOnly: ERC20RegisterOnlyToken[];
    };
}

export interface ERC721TokensConfig {
    RedeemableTokens: {
        deployAndRegister: ERC721DeployAndRegisterToken[];
        registerOnly: ERC721RegisterOnlyToken[];
    };
    SimpleTokens: {
        deployAndRegister: ERC721DeployAndRegisterToken[];
        registerOnly: ERC721RegisterOnlyToken[];
    };
}

export interface AssetsConfig {
    ERC20Tokens: ERC20TokensConfig;
    ERC721Tokens: ERC721TokensConfig;
}

export interface AssetConfig {
    verifyContracts: boolean;
    shouldDeployDevelopmentVault: boolean;
    assets: AssetsConfig;
}

export interface VerifyContractConfig {
    name: string;
    address: string;
    constructorArguments: any[];
}

export interface DeployedContract {
    abi: any[];
    address: string;
    info?: string;
}

export interface DeployedContracts {
    [key: string]: DeployedContract;
}
