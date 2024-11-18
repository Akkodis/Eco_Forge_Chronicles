// scripts/metadata_generation/createMetadataFiles.ts

import { assetConfig } from '../config/assetConfig';
import {
    ERC20DeployAndRegisterToken,
    ERC721DeployAndRegisterToken,
    ERC20RegisterOnlyToken,
    ERC721RegisterOnlyToken,
    Metadata
} from '../utils/configInterfaces';
import * as fs from 'fs';
import * as path from 'path';

function generateMetadata() {
    const outputDir = path.join(__dirname, 'metadata');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const tokens: Array<
        ERC20DeployAndRegisterToken |
        ERC721DeployAndRegisterToken |
        ERC20RegisterOnlyToken |
        ERC721RegisterOnlyToken
    > = [];

    function collectTokens(tokenGroup: { deployAndRegister: any[]; registerOnly: any[]; }) {
        tokens.push(...tokenGroup.deployAndRegister);
        tokens.push(...tokenGroup.registerOnly);
    }

    collectTokens(assetConfig.assets.ERC20Tokens.PaymentTokens);
    collectTokens(assetConfig.assets.ERC20Tokens.SimpleTokens);
    collectTokens(assetConfig.assets.ERC721Tokens.RedeemableTokens);
    collectTokens(assetConfig.assets.ERC721Tokens.SimpleTokens);

    for (const token of tokens) {
        if (!token.generateMetadata) {
            console.log(`Skipping metadata generation for token ${token.name} due to generateMetadata flag.`);
            continue;
        }

        if (!token.metadata) {
            console.warn(`Cannot generate metadata for token ${token.name} because metadata is missing.`);
            continue;
        }

        const tokenOutputDir = path.join(outputDir, token.name.replace(/\s+/g, '_'));

        if (!fs.existsSync(tokenOutputDir)) {
            fs.mkdirSync(tokenOutputDir, { recursive: true });
        }

        switch (token.contractType) {
            case 'ERC721Redeemable':
            case 'ERC721Simple':
                const erc721Token = token as ERC721DeployAndRegisterToken | ERC721RegisterOnlyToken;
                const totalSupply = erc721Token.totalSupply || 1;

                const baseMetadata = erc721Token.metadata!;

                for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
                    const metadata: Metadata = {
                        ...baseMetadata,
                        name: `${baseMetadata.name || erc721Token.name} #${tokenId}`,
                        image: baseMetadata.image ? `${baseMetadata.image}${tokenId}.png` : undefined,
                        external_url: baseMetadata.external_url ? `${baseMetadata.external_url}/${tokenId}` : undefined,
                    };

                    const metadataFilePath = path.join(tokenOutputDir, `${tokenId}`);

                    fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));

                    console.log(`Generated metadata for token ${erc721Token.name} tokenId ${tokenId}`);
                }
                break;

            case 'ERC20EcoBound':
            case 'ERC20Simple':
                const erc20Token = token as ERC20DeployAndRegisterToken | ERC20RegisterOnlyToken;

                if (!erc20Token.metadata) {
                    console.warn(`Cannot generate metadata for token ${erc20Token.name} because metadata is missing.`);
                    continue;
                }

                const erc20MetadataFilePath = path.join(tokenOutputDir, `${erc20Token.name.replace(/\s+/g, '_')}`);

                fs.writeFileSync(erc20MetadataFilePath, JSON.stringify(erc20Token.metadata, null, 2));

                console.log(`Generated metadata for ERC20 token ${erc20Token.name}`);
                break;

            default:
                console.warn(`Unknown contract type ${token.contractType} for token ${token.name}`);
                break;
        }
    }
}

generateMetadata();
