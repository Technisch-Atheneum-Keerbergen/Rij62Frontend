const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseJSONSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null; // return null if response is empty or invalid JSON
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!res.ok) {
    const error = await parseJSONSafe(res);
    throw new Error(error?.title || res.statusText);
  }

  return parseJSONSafe(res);
}

export async function apiAdd(
  endpoint: string,
  data: any,
  method: 'POST' | 'PUT' = 'POST'
) {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!res.ok) {
    const error = await parseJSONSafe(res);
    throw new Error(error?.title || res.statusText);
  }

  return parseJSONSafe(res);
}

export async function apiDelete(
  endpoint: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    ...options
  });

  if (!res.ok) {
    const error = await parseJSONSafe(res);
    throw new Error(error?.title || res.statusText);
  }

  return parseJSONSafe(res);
}

export async function apiToggle(productId: number) {
  const product = await apiFetch(`/product/${productId}`);
  if (!product) return null; // safely return null if product not found

  const updatedProduct = {
    ...product,
    isAvailable: !product.isAvailable
  };

  const res = await fetch(`${API_BASE_URL}/product/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedProduct)
  });

  if (!res.ok) {
    const error = await parseJSONSafe(res);
    throw new Error(error?.title || res.statusText);
  }

  return parseJSONSafe(res) || updatedProduct;
}