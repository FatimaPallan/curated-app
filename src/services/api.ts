export type ApiProduct = {
  id: string;
  title: string;
  description?: string;
  price?: string;
  category?: 'accessories' | 'gifts';
  imageUrl?: string;
  badge?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function fetchProducts(category: 'accessories' | 'gifts') {
  try {
    const res = await fetch(`${API_BASE}/products?category=${category}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as ApiProduct[];
    return data;
  } catch (err) {
    console.error('Failed to fetch products from API', err);
    return [];
  }
}

export async function fetchAllProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { accessories: ApiProduct[]; gifts: ApiProduct[] };
  } catch (err) {
    console.error('Failed to fetch products from API', err);
    return { accessories: [], gifts: [] };
  }
}

export async function createProduct(product: Omit<ApiProduct, 'id'>) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ApiProduct;
}

export async function deleteProduct(id: string, category?: 'accessories' | 'gifts') {
  const res = await fetch(
    `${API_BASE}/products/${id}${category ? `?category=${category}` : ''}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ApiProduct;
}

