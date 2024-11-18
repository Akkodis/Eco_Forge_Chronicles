import { AssetConfig } from '../utils/configInterfaces';

export const assetConfig: AssetConfig = {
    verifyContracts: true,
    shouldDeployDevelopmentVault: true,
    assets: {
        ERC20Tokens: {
            PaymentTokens: {
                deployAndRegister: [
                    {
                        name: "USDC",
                        symbol: "USDC",
                        maxSupply: "100000000000",
                        ecoBound: false,
                        triggersIncentive: false,
                        contractType: "ERC20Simple",
                        usage: "Payment",
                        shouldMint: true,
                        generateMetadata: false
                    },
                    {
                        name: "WIOTA",
                        symbol: "WIOTA",
                        maxSupply: "100000000000",
                        ecoBound: false,
                        triggersIncentive: false,
                        contractType: "ERC20Simple",
                        usage: "Payment",
                        shouldMint: true,
                        generateMetadata: false
                    },
                    {
                        name: "WBTC",
                        symbol: "WBTC",
                        maxSupply: "100000000000",
                        ecoBound: false,
                        triggersIncentive: false,
                        contractType: "ERC20Simple",
                        usage: "Payment",
                        shouldMint: true,
                        generateMetadata: false
                    },
                    {
                        name: "WETH",
                        symbol: "WETH",
                        maxSupply: "100000000000",
                        ecoBound: false,
                        triggersIncentive: false,
                        contractType: "ERC20Simple",
                        usage: "Payment",
                        shouldMint: true,
                        generateMetadata: false,
                    },
                    {
                        name: "Magic Coin",
                        symbol: "MAC",
                        tokenURI: "ipfs://QmTD31QqYsKio2SKyS9ZtKS8YF3uroedsq284Rsp1c9sPY",
                        ecoBound: true,
                        releasable: true,
                        maxSupply: "100000000000",
                        triggersIncentive: true,
                        contractType: "ERC20EcoBound",
                        usage: "Incentive",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Magic Coin",
                            description: "Magic Coin is the native token used for incentives within the ecosystem.",
                            external_url: "https://example.com/magincoin",
                            image: "ipfs://QmSozLoaoUQeN31RxDgEEPWWCHmYFQ6F9RoXw2fsWSa9sa",
                            attributes: [
                                { trait_type: "Type", value: "Native Token" },
                                { trait_type: "EcoBound", value: "True" }
                            ]
                        }
                    }
                ],
                registerOnly: []
            },
            SimpleTokens: {
                deployAndRegister: [
                    {
                        name: "Magic Wood",
                        symbol: "MAGICWOOD",
                        tokenURI: "ipfs://QmZ8Bq87afRL9vrrVHkeTyudi8GZZfB6jMCh9xsFB1CxUp",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "100000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Magic Wood",
                            description: "A rare type of wood imbued with magical properties.",
                            external_url: "https://example.com/magicwood",
                            image: "ipfs://Qma5eYWztdSymk82S6WVCPoBtLon729BtVUVhDKzXXfrPv",
                            attributes: [
                                { trait_type: "Rarity", value: "Rare" },
                                { trait_type: "Material", value: "Wood" },
                                { trait_type: "Level", value: 5, display_type: "number", max_value: 10 },
                                { trait_type: "Magic Power", value: 80, display_type: "boost_number", max_value: 100 }
                            ]
                        }
                    },
                    {
                        name: "Simple Stone",
                        symbol: "SIMPLESTONE",
                        tokenURI: "https://ipfs.filebase.io/ipfs/QmTEZK1MBP6SkoXKgPGLkFE9dnCacn154dr8NmeWLMzLTH",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "100000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Simple Stone",
                            description: "An ordinary stone used for crafting and building.",
                            external_url: "https://example.com/simplestone",
                            image: "ipfs://Qme8W6i5fqSPQu6eU9dP52sJNBNweLRd1bzG3Yh6YXkQtk",
                            attributes: [
                                { trait_type: "Rarity", value: "Common" },
                                { trait_type: "Material", value: "Stone" }
                            ]
                        }
                    },
                    {
                        name: "Enchanted Iron",
                        symbol: "ENCHANTEDIRON",
                        tokenURI: "ipfs://Qma3Uod2rUDkJuZoQLPuj25dokSVMnC7BiCkGGasfPfcw5",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "50000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Enchanted Iron",
                            description: "Iron with magical enchantments, ideal for powerful weapons.",
                            external_url: "https://example.com/enchantediron",
                            image: "ipfs://QmNMpckuF9L1STpakskwFsX4DgXHZ7UG2w39DUFctZBrFv",
                            attributes: [
                                { trait_type: "Rarity", value: "Uncommon" },
                                { trait_type: "Material", value: "Iron" },
                                { trait_type: "Hardness", value: 70, display_type: "number", max_value: 100 },
                                { trait_type: "Magic Conductivity", value: 60, display_type: "boost_number", max_value: 100 }
                            ]
                        }
                    },
                    {
                        name: "Mystic Crystal",
                        symbol: "MYSTICCRYSTAL",
                        tokenURI: "ipfs://QmQramiV5nMhM5s1bz1GLHwvWCH8qZfDrDJkxuS6ZFDWUS",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "20000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Mystic Crystal",
                            description: "A crystal filled with mystical energies.",
                            external_url: "https://example.com/mysticcrystal",
                            image: "ipfs://QmRMX54tGRbUaffmoQhnX9qcZchfo4Z66ZWtptJ8aLvb2F",
                            attributes: [
                                { trait_type: "Rarity", value: "Epic" },
                                { trait_type: "Material", value: "Crystal" },
                                { trait_type: "Energy", value: 90, display_type: "number", max_value: 100 },
                                { trait_type: "Mystic Power", value: 95, display_type: "boost_number", max_value: 100 }
                            ]
                        }
                    },
                    {
                        name: "Phantom Silk",
                        symbol: "PHANTOMSILK",
                        tokenURI: "ipfs://QmXe3mDcTjifGb5fMMMH2M3p5NMaKZ8keR149NVuczkv2k",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "75000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Phantom Silk",
                            description: "A rare fabric woven from the threads of phantom spiders.",
                            external_url: "https://example.com/phantomsilk",
                            image: "ipfs://QmRMX54tGRbUaffmoQhnX9qcZchfo4Z66ZWtptJ8aLvb2F",
                            attributes: [
                                { trait_type: "Rarity", value: "Very Rare" },
                                { trait_type: "Material", value: "Silk" },
                                { trait_type: "Smoothness", value: 85, display_type: "number", max_value: 100 },
                                { trait_type: "Invisibility", value: 50, display_type: "boost_percentage" }
                            ]
                        }
                    },
                    {
                        name: "Dragon Scale",
                        symbol: "DRAGONSCALE",
                        tokenURI: "ipfs://Qmb6fLVARLzkHSmgwMqrdzRA77yd78jcdbmbv6VDikdg82",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "10000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Dragon Scale",
                            description: "Scales from legendary dragons, extremely durable and magical.",
                            external_url: "https://example.com/dragonscale",
                            image: "ipfs://QmPU8Fqw2yT6sBUBGiSZNgfzuM7rZ9kVDEavx6KEwGYHVC",
                            attributes: [
                                { trait_type: "Rarity", value: "Legendary" },
                                { trait_type: "Material", value: "Scale" },
                                { trait_type: "Hardness", value: 100, display_type: "number", max_value: 100 },
                                { trait_type: "Fire Resistance", value: 100, display_type: "boost_number", max_value: 100 }
                            ]
                        }
                    },
                    {
                        name: "Elixir of Life",
                        symbol: "ELIXIROFLIFE",
                        tokenURI: "ipfs://QmQVaprPM1HU1K26D7zW6ZzBLd6wGaGdZ4z4M2Cr1jngoA",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "5000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Elixir of Life",
                            description: "A rare elixir that increases life energy.",
                            external_url: "https://example.com/elixiroflife",
                            image: "ipfs://QmVL3k2VWzcpXHUzVcosZVt5R3NLUbsVbkhPKJR1fTjGxP",
                            attributes: [
                                { trait_type: "Rarity", value: "Mythic" },
                                { trait_type: "Type", value: "Elixir" },
                                { trait_type: "Life Energy", value: 100, display_type: "boost_number", max_value: 100 }
                            ]
                        }
                    },
                    {
                        name: "Shadow Essence",
                        symbol: "SHADOWESSENCE",
                        tokenURI: "ipfs://QmWELJPjbStDaTh5VF4CdusodPUjRJqMxzHjGBeF77DQt2",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "30000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Shadow Essence",
                            description: "The essence of shadows, used for dark magic.",
                            external_url: "https://example.com/shadowessence",
                            image: "ipfs://QmY8bfMfHMakJKtg9qjcWoDoQ9pkcgowv4gP33juc8txAF",
                            attributes: [
                                { trait_type: "Rarity", value: "Rare" },
                                { trait_type: "Element", value: "Shadow" },
                                { trait_type: "Dark Power", value: 85, display_type: "boost_number", max_value: 100 }
                            ]
                        }
                    },
                    {
                        name: "Sunstone",
                        symbol: "SUNSTONE",
                        tokenURI: "ipfs://QmbmiH8hVSZinH8hNMBzkrSHUtxrqtJJTnRigQ6FeRWGbx",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "25000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Sunstone",
                            description: "A stone that contains the energy of the sun.",
                            external_url: "https://example.com/sunstone",
                            image: "ipfs://QmQzaS7c1t3ozaqokV6v8aqJaCBN6mkDSHhfVMvgtjJAyh",
                            attributes: [
                                { trait_type: "Rarity", value: "Uncommon" },
                                { trait_type: "Element", value: "Light" },
                                { trait_type: "Light Power", value: 75, display_type: "boost_number", max_value: 100 }
                            ]
                        }
                    },
                    {
                        name: "Lunar Dust",
                        symbol: "LUNARDUST",
                        tokenURI: "ipfs://QmXnDFhgsA8mf2nj2DW3HgAbqdnHa5GjfUJxLJiT9XbMzs",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "40000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Lunar Dust",
                            description: "Fine dust from the moon, full of magical energy.",
                            external_url: "https://example.com/lunardust",
                            image: "ipfs://Qmbh15pHTHv4k8JCaHdnh7kHRLPCxXtCU1o4t7h15aBRz1",
                            attributes: [
                                { trait_type: "Rarity", value: "Rare" },
                                { trait_type: "Element", value: "Moon" },
                                { trait_type: "Magic", value: 80, display_type: "boost_number", max_value: 100 }
                            ]
                        }
                    },
                    {
                        name: "Ancient Rune",
                        symbol: "ANCIENTRUNE",
                        tokenURI: "ipfs://QmZH3kQYFKbpQvPKKzZK63MruECgbPKXSHXauh4S5291Hk",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "15000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Ancient Rune",
                            description: "A rune from ancient times, contains lost knowledge.",
                            external_url: "https://example.com/ancientrune",
                            image: "ipfs://QmThyWxq7HpxU5Kww8uNGfHhYvd7GstFc9RZhq9ntKjnnQ",
                            attributes: [
                                { trait_type: "Rarity", value: "Epic" },
                                { trait_type: "Type", value: "Rune" },
                                { trait_type: "Knowledge", value: 95, display_type: "boost_number", max_value: 100 }
                            ]
                        }
                    },
                    {
                        name: "Spirit Feather",
                        symbol: "SPIRITFEATHER",
                        tokenURI: "ipfs://QmWXaNUn4JPvYRyNC4Am9o737oQg1sL53isMSh2PqJ5T4K",
                        ecoBound: true,
                        releasable: false,
                        maxSupply: "60000000000",
                        triggersIncentive: false,
                        contractType: "ERC20EcoBound",
                        usage: "Asset",
                        shouldMint: true,
                        generateMetadata: true,
                        metadata: {
                            name: "Spirit Feather",
                            description: "A feather that contains the essence of a spirit.",
                            external_url: "https://example.com/spiritfeather",
                            image: "ipfs://QmbQ8ib5v5ZNjAy9ShV4vYeZLRhtgmLp4m9gaVcj1ZPn9Z",
                            attributes: [
                                { trait_type: "Rarity", value: "Very Rare" },
                                { trait_type: "Material", value: "Feather" },
                                { trait_type: "Spirit Power", value: 90, display_type: "boost_number", max_value: 100 }
                            ]
                        }
                    }
                ],
                registerOnly: []
            }
        },
        ERC721Tokens: {
            RedeemableTokens: {
                deployAndRegister: [
                    {
                        name: "Arcane Relics",
                        symbol: "ARCRELICS",
                        contractType: "ERC721Redeemable",
                        usage: "Asset",
                        shouldMint: true,
                        baseURI: "ipfs://QmYBAkmZRoUbpxC9NG4G8YuuhHEKdQeSKiu1aDoaWC2tbW/",
                        totalSupply: 250,
                        generateMetadata: true,
                        metadata: {
                            name: "Arcane Relics",
                            description: "Arcane relics are rare items with magical properties.",
                            external_url: "https://example.com/arcanerelics",
                            image: "ipfs://QmcJkVXoeqaNtawo6eWfiX1emNWmRsvWg9QNUyo2YUpRGu/",
                            attributes: [
                                { trait_type: "Type", value: "Relic" },
                                { trait_type: "Rarity", value: "Legendary" },
                                { trait_type: "Aqua Power", value: 40, display_type: "boost_number", max_value: 100 },
                                { trait_type: "Stamina Increase", value: 10, display_type: "boost_percentage" },
                                { trait_type: "Generation", value: 2, display_type: "number" },
                                { trait_type: "Birthday", value: 1546360800, display_type: "date" }
                            ]
                        }
                    }
                ],
                registerOnly: []
            },
            SimpleTokens: {
                deployAndRegister: [],
                registerOnly: [
                    {
                        name: "Gaming Cards",
                        address: "0x72b1865292dc85B46E9e2fc505791e22d2d7A53A",
                        ecoBound: false,
                        contractType: "ERC721Simple",
                        usage: "Asset",
                        totalSupply: 5000,
                        generateMetadata: false,
                    },
                    {
                        name: "Item Cards",
                        address: "0x0caa1C0f2a6B9630510e2ecEb092B248B197B19f",
                        ecoBound: false,
                        contractType: "ERC721Simple",
                        usage: "Asset",
                        totalSupply: 3000,
                        generateMetadata: false,
                    }
                ]
            }
        }
    }
};
