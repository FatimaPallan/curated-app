import { createClient } from '@sanity/client';
import { SANITY_CONFIG } from '../config';

export type CmsProduct = {
  _id: string;
  title: string;
  description?: string;
  price?: string;
  category?: 'accessories' | 'gifts';
  image?: { asset?: { url?: string } } | string;
  imageUrl?: string;
  badge?: string;
  order?: number;
};

export function hasSanityConfig() {
  return Boolean(SANITY_CONFIG.projectId && SANITY_CONFIG.dataset);
}

const client = hasSanityConfig()
  ? createClient({
      projectId: SANITY_CONFIG.projectId,
      dataset: SANITY_CONFIG.dataset,
      apiVersion: SANITY_CONFIG.apiVersion,
      useCdn: SANITY_CONFIG.useCdn,
      token: SANITY_CONFIG.token,
      perspective: 'published',
    })
  : null;

export async function fetchProductsFromSanity(category: 'accessories' | 'gifts') {
  if (!client) return [];

  const query = `
    *[_type == "product" && category == $category] | order(order asc, _createdAt desc) {
      _id,
      title,
      description,
      price,
      category,
      badge,
      order,
      "imageUrl": coalesce(image.asset->url, imageUrl)
    }
  `;

  try {
    const data = await client.fetch<CmsProduct[]>(query, { category });
    return data;
  } catch (error) {
    console.error('Failed to fetch Sanity products', error);
    return [];
  }
}

