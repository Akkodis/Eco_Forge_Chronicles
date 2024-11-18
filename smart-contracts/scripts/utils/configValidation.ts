import { z } from "zod";
import { AssetConfig } from "./configInterfaces";

const ContractTypeSchema = z.enum(['ERC20EcoBound', 'ERC20Simple', 'ERC721Redeemable', 'ERC721Simple']);
const TokenUsageSchema = z.enum(['Payment', 'Asset', 'Incentive']);

const TraitSchema = z.object({
    trait_type: z.string().optional(),
    value: z.union([z.string(), z.number()]),
    display_type: z.string().optional(),
    max_value: z.number().optional(),
});

const MetadataSchema = z.object({
    description: z.string(),
    external_url: z.string().optional(),
    image: z.string().optional(),
    image_data: z.string().optional(),
    name: z.string(),
    attributes: z.array(TraitSchema).optional(),
    background_color: z.string().optional(),
    animation_url: z.string().optional(),
    youtube_url: z.string().optional(),
});

const ERC20DeployAndRegisterTokenSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    tokenURI: z.string().optional(),
    ecoBound: z.boolean(),
    releasable: z.boolean().optional(),
    maxSupply: z.string(),
    triggersIncentive: z.boolean(),
    contractType: ContractTypeSchema,
    usage: TokenUsageSchema,
    shouldMint: z.boolean().optional(),
    generateMetadata: z.boolean().optional(),
    metadata: MetadataSchema.optional(),
}).superRefine((data, ctx) => {
    if (data.generateMetadata && !data.metadata) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['metadata'],
            message: 'Metadata is required when generateMetadata is true.',
        });
    }
});

const ERC20RegisterOnlyTokenSchema = z.object({
    name: z.string(),
    triggersIncentive: z.boolean(),
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    ecoBound: z.boolean().optional(),
    contractType: ContractTypeSchema,
    usage: TokenUsageSchema,
    generateMetadata: z.boolean().optional(),
    metadata: MetadataSchema.optional(),
}).superRefine((data, ctx) => {
    if (data.generateMetadata && !data.metadata) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['metadata'],
            message: 'Metadata is required when generateMetadata is true.',
        });
    }
});

const ERC721DeployAndRegisterTokenSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    baseURI: z.string().optional(),
    tokenURI: z.string().optional(),
    contractType: ContractTypeSchema,
    usage: TokenUsageSchema,
    shouldMint: z.boolean().optional(),
    generateMetadata: z.boolean().optional(),
    metadata: MetadataSchema.optional(),
    totalSupply: z.number().optional(),
}).superRefine((data, ctx) => {
    if (data.generateMetadata && !data.metadata) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['metadata'],
            message: 'Metadata is required when generateMetadata is true.',
        });
    }
});

const ERC721RegisterOnlyTokenSchema = z.object({
    name: z.string(),
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    ecoBound: z.boolean(),
    contractType: ContractTypeSchema,
    usage: TokenUsageSchema,
    generateMetadata: z.boolean().optional(),
    metadata: MetadataSchema.optional(),
    totalSupply: z.number().optional(),
}).superRefine((data, ctx) => {
    if (data.generateMetadata && !data.metadata) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['metadata'],
            message: 'Metadata is required when generateMetadata is true.',
        });
    }
});

export const AssetConfigSchema: z.ZodSchema<AssetConfig> = z.object({
    verifyContracts: z.boolean(),
    shouldDeployDevelopmentVault: z.boolean(),
    assets: z.object({
        ERC20Tokens: z.object({
            PaymentTokens: z.object({
                deployAndRegister: z.array(ERC20DeployAndRegisterTokenSchema),
                registerOnly: z.array(ERC20RegisterOnlyTokenSchema),
            }),
            SimpleTokens: z.object({
                deployAndRegister: z.array(ERC20DeployAndRegisterTokenSchema),
                registerOnly: z.array(ERC20RegisterOnlyTokenSchema),
            }),
        }),
        ERC721Tokens: z.object({
            RedeemableTokens: z.object({
                deployAndRegister: z.array(ERC721DeployAndRegisterTokenSchema),
                registerOnly: z.array(ERC721RegisterOnlyTokenSchema),
            }),
            SimpleTokens: z.object({
                deployAndRegister: z.array(ERC721DeployAndRegisterTokenSchema),
                registerOnly: z.array(ERC721RegisterOnlyTokenSchema),
            }),
        }),
    }),
});
