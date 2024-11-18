export enum ProtocolCapability {
    CanCreatePool = 0,
    CanAddTokensToPool = 1,
    CanDispenseRewards = 2,
    CanRemoveTokensFromPool = 3,
    CanDeactivatePool = 4,
    CanTransferTokensBetweenPools = 5,
}

export enum AssetReservoirCapability {
    CanCreatePool = 0,
    CanAddTokensToPool = 1,
    CanDispenseRewards = 2,
    CanRemoveTokensFromPool = 3,
    CanDeactivatePool = 4,
    CanTransferTokensBetweenPools = 5,
}

export enum KYCVerificationCapability {
    CanSetKYCLevel = 0,
    CanAddKYCNFTContract = 1,
    CanRemoveKYCNFTContract = 2,
    CanReadKYCLevel = 3,
}

export enum ERC20EcoBoundCapability {
    CanReleaseEcoBoundToken = 0,
    CanTransferEcoBoundToken = 1,
}

export function getProtocolCapabilityValue(capabilityName: string): number {
    const capValue = (ProtocolCapability as any)[capabilityName];
    if (capValue === undefined) {
        throw new Error(`Invalid Protocol Capability Name: ${capabilityName}`);
    }
    return capValue;
}

export function getAssetReservoirCapabilityValue(capabilityName: string): number {
    const capValue = (AssetReservoirCapability as any)[capabilityName];
    if (capValue === undefined) {
        throw new Error(`Invalid AssetReservoir Capability Name: ${capabilityName}`);
    }
    return capValue;
}

export function getKYCVerificationCapabilityValue(capabilityName: string): number {
    const capValue = (KYCVerificationCapability as any)[capabilityName];
    if (capValue === undefined) {
        throw new Error(`Invalid KYCVerification Capability Name: ${capabilityName}`);
    }
    return capValue;
}

export function getERC20EcoBoundCapabilityValue(capabilityName: string): number {
    const capValue = (ERC20EcoBoundCapability as any)[capabilityName];
    if (capValue === undefined) {
        throw new Error(`Invalid ERC20EcoBound Capability Name: ${capabilityName}`);
    }
    return capValue;
}
