export const APP_TITLE = 'Curations by Amreen';
export const APP_DESCRIPTION =
  'Elegant handcrafted accessories and bespoke gifts, curated by Amreen.';

export const SOCIAL = {
  accessoriesLabel: 'EverGlow Accessories',
  giftsLabel: 'Gifts & Crafts Hub',
  instagramAccessories: 'ever_glow_accessories01',
  instagramGifts: 'gifts_n_crafts_hub',
  whatsappNumber: '917406785941',
};

export const SANITY_CONFIG = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: '2023-10-01',
  useCdn: true,
  token: import.meta.env.VITE_SANITY_API_TOKEN,
};

export const ANALYTICS_ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

