import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseJSONSafe(res: Response) {
	try {
		return await res.json();
	} catch {
		return null; // return null if response is empty or invalid JSON
	}
}

function addAuth(options: RequestInit = {}): RequestInit {
	const { token } = get(auth);

	return {
		...options,
		headers: {
			...(options.headers || {}),
			Authorization: token ? `Bearer ${token}` : ''
		}
	};
}

/* Calls the api at 'endpoint' not expecting any data.
 * If the request fails this function will throw an Error
 */
export async function apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
	const res = await fetch(`${API_BASE_URL}${endpoint}`, addAuth(options));
	if (res.status === 401) {
		auth.logout();
	}

	if (!res.ok) {
		let error = null;
		try {
			error = (await res.json())?.title;
		} catch (e) {
			error = 'Failed to parse error json: ' + e;
		}
		throw new Error(res.statusText + ': ' + error);
	}
	return res;
}

/* Fetches the api at 'endpoint' and returns the result as T parsed as json.
 * If the request fails or the server returns invalid json this function will throw an Error
 */
export async function apiFetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const res = await apiCall(endpoint, options);
	try {
		return (await res.json()) as T;
	} catch (e) {
		throw new Error('Failed to parse data returned by server: ' + e);
	}
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
	const res = await fetch(`${API_BASE_URL}${endpoint}`, addAuth(options));
	if (res.status === 401) {
		auth.logout();
	}

	if (!res.ok) {
		const error = await parseJSONSafe(res);
		throw new Error(error?.title || res.statusText);
	}

	return parseJSONSafe(res);
}

export async function apiAdd<T = unknown>(endpoint: string, data: T, method: string = 'POST') {
	const options: RequestInit = addAuth({
		method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});

	const res = await fetch(`${API_BASE_URL}${endpoint}`, options);

	if (res.status === 401) {
		auth.logout();
	}

	if (!res.ok) {
		const error = await parseJSONSafe(res);
		throw new Error(error?.title || res.statusText);
	}

	return parseJSONSafe(res) as Promise<T | null>;
}

export async function apiDelete(endpoint: string, options: RequestInit = {}) {
	const res = await fetch(
		`${API_BASE_URL}${endpoint}`,
		addAuth({
			method: 'DELETE',
			...options
		})
	);

	if (res.status === 401) {
		auth.logout();
	}

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

	const res = await fetch(
		`${API_BASE_URL}/product/${productId}`,
		addAuth({
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updatedProduct)
		})
	);

	if (res.status === 401) {
		auth.logout();
	}

	if (!res.ok) {
		const error = await parseJSONSafe(res);
		throw new Error(error?.title || res.statusText);
	}

	return (await parseJSONSafe(res)) || updatedProduct;
}

export async function apiUpload(endpoint: string, formData: FormData) {
	const res = await fetch(`${API_BASE_URL}${endpoint}`, {
		method: 'POST',
		...addAuth(),
		body: formData
	});

	if (res.status === 401) {
		auth.logout();
	}

	if (!res.ok) {
		const error = await parseJSONSafe(res);
		throw new Error(error?.title || res.statusText);
	}

	return parseJSONSafe(res) || (await res.text());
}
export function getImageUrl(id: string) {
	return `${API_BASE_URL}/image/${id}`;
}
