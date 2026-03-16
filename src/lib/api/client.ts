const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {

  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.title || res.statusText);
  }

  return res.json();
}