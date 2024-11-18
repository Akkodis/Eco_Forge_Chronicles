import { ThemingMap } from '@web3-onboard/core/dist/types';

export const customTheme: ThemingMap = {
  '--w3o-background-color': '#1c1c1c',
  '--w3o-foreground-color': '#121212',
  '--w3o-text-color': '#ffffff',
  '--w3o-border-color': '#1c1c1c',
  '--w3o-action-color': '#feb001',
  '--w3o-border-radius': '0',
};

export const walletAppMetadata = {
  name: 'ECO FORGE CHRONICLES dApp',
  icon: '/assets/logos/project_logo.svg',
  description: 'ECO FORGE CHRONICLES wallet',
  reconnectTimeoutMs: 2500,
  agreement: {
    version: '1.0.0',
    privacyUrl: 'https://localhost:4200/privacy',
  },
};

export const selectingWallet = {
  header: 'Choose Your Gateway to Eco Forge Chronicles',
  sidebar: {
    heading: 'Enter the Realm of Conquest',
    subheading: 'ECO FORGE CHRONICLES',
    paragraph: 'Connect your wallet to engage in the world of EFC.',
  },
};

export const appTitle = {
  appTitle: 'Eco Forge Chronicles',
};

export const appAttributes = {
  currency: '$CUR',
  currencyName: 'Currency',
  currencyIcon: '/assets/images/icon-assets/currencyIcon.png',
  baseUrl: 'http://localhost:4200',
  defaultLanguage: 'en',
};

export const filterAttributes = {
  STARS: {
    ONE_STAR_INACTIVE: '/assets/images/icon-assets/1StarInactive.png',
    ONE_STAR_ACTIVE: '/assets/images/icon-assets/1StarActive.png',
    TWO_STAR_INACTIVE: '/assets/images/icon-assets/2StarInactive.png',
    TWO_STAR_ACTIVE: '/assets/images/icon-assets/2StarActive.png',
    THREE_STAR_INACTIVE: '/assets/images/icon-assets/3StarInactive.png',
    THREE_STAR_ACTIVE: '/assets/images/icon-assets/3StarActive.png',
    FOUR_STAR_INACTIVE: '/assets/images/icon-assets/4StarInactive.png',
    FOUR_STAR_ACTIVE: '/assets/images/icon-assets/4StarActive.png',
    FIVE_STAR_INACTIVE: '/assets/images/icon-assets/5StarInactive.png',
    FIVE_STAR_ACTIVE: '/assets/images/icon-assets/5StarActive.png',
  },
  ELEMENTS: {
    FIRE: '/assets/images/icon-assets/fireInactive.png',
    ICE: '/assets/images/icon-assets/iceInactive.png',
    SPIRIT: '/assets/images/icon-assets/spiritInactive.png',
    NEUTRAL: '/assets/images/icon-assets/neutralInactive.png ',
    HOLY: '/assets/images/icon-assets/holyInactive.png',
    DARK: '/assets/images/icon-assets/darkInactive.png',
    NATURE: '/assets/images/icon-assets/natureInactive.png',
  },
  RARITY: {
    COMMON: '/assets/images/icon-assets/commonInactive.png',
    UNCOMMON: '/assets/images/icon-assets/uncommonInactive.png',
    RARE: '/assets/images/icon-assets/rareInactive.png',
    EPIC: '/assets/images/icon-assets/epicInactive.png',
    LEGENDARY: '/assets/images/icon-assets/legendaryInactive.png',
    MYTHIC: '/assets/images/icon-assets/mythicInactive.png',
  },
};
