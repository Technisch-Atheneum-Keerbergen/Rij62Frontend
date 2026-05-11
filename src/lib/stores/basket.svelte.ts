// src/lib/stores/basket.svelte.ts
import { browser } from '$app/environment';
import { apiFetch } from '$lib/api/client';

import type { Product, ProductId } from '$lib/api/types/product';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BasketChoice {
	id: number;
	quantity: number;
}

/** What we persist – minimal, price-free snapshot */
export interface BasketItem {
	productId: ProductId;
	quantity: number;
	choices: BasketChoice[];
}

/** A choice is just a product + how many of it were selected */
export interface LoadedBasketChoice {
	product: Product;
	quantity: number;
}

/** Fully resolved item, enriched lazily from the API */
export interface LoadedBasketItem {
	product: Product;
	quantity: number;
	choices: LoadedBasketChoice[];
}

export function getItemTotal(item: LoadedBasketItem): number {
	const choicesTotal = item.choices.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
	return (item.product.price + choicesTotal) * item.quantity;
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'basket';

function loadFromStorage(): BasketItem[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as BasketItem[]) : [];
	} catch (err) {
		console.error('Failed to load basket from storage:', err);
		return [];
	}
}

function saveToStorage(items: BasketItem[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch (err) {
		console.error('Failed to save basket to storage:', err);
	}
}

// ---------------------------------------------------------------------------
// Core reactive state (module-level $state = singleton, shared app-wide)
// ---------------------------------------------------------------------------

let items = $state<BasketItem[]>(loadFromStorage());

// Persist whenever items change
$effect.root(() => {
	$effect(() => {
		if (browser) saveToStorage(items);
	});
});

// ---------------------------------------------------------------------------
// Derived state
// ---------------------------------------------------------------------------

export function basketCount() {
	return items.reduce((sum, item) => sum + item.quantity, 0);
}

// ---------------------------------------------------------------------------
// Product cache
// Keyed by productId, stores Promises so concurrent callers share one fetch.
// ---------------------------------------------------------------------------

const productCache = new Map<ProductId, Promise<Product>>();

function fetchProduct(productId: ProductId): Promise<Product> {
	if (!productCache.has(productId)) {
		productCache.set(
			productId,
			apiFetch('/product/' + productId).catch((err) => {
				productCache.delete(productId); // evict on failure so next call retries
				throw err;
			})
		);
	}
	return productCache.get(productId)!;
}

// ---------------------------------------------------------------------------
// Derived loaded items
// Re-derives as a new Promise whenever items changes, so quantity updates
// and additions/removals are reflected without re-fetching from the network
// (products stay cached).
// ---------------------------------------------------------------------------

function buildLoadedItems(snapshot: BasketItem[]): Promise<LoadedBasketItem[]> {
	return Promise.allSettled(
		snapshot.map(async (item): Promise<LoadedBasketItem> => {
			const [product, ...choiceProducts] = await Promise.all([
				fetchProduct(item.productId),
				...item.choices.map((c) => fetchProduct(c.id))
			]);

			return {
				product,
				quantity: item.quantity,
				choices: choiceProducts.map((choiceProduct, i) => ({
					product: choiceProduct,
					quantity: item.choices[i].quantity
				}))
			};
		})
	).then((settled) =>
		settled
			.filter((r): r is PromiseFulfilledResult<LoadedBasketItem> => r.status === 'fulfilled')
			.map((r) => r.value)
	);
}

// $derived re-runs buildLoadedItems every time items (or any nested value) changes.
// Because products are cached, re-runs after quantity changes resolve instantly.
const loadedItems = $derived(buildLoadedItems(items));

// ---------------------------------------------------------------------------
// Basket
// ---------------------------------------------------------------------------

export const basket = {
	/** Read-only access to raw persisted items (reactive) */
	get items(): BasketItem[] {
		return items;
	},

	/**
	 * Fully enriched basket, reactive.
	 * Rebuilds whenever items changes; products are cached so only new
	 * products hit the network. Quantity changes resolve instantly.
	 */
	get loadedItems(): Promise<LoadedBasketItem[]> {
		return loadedItems;
	},

	add(product: Product, choices: BasketChoice[], quantity = 1): void {
		const choicesKey = JSON.stringify(choices);
		const existing = items.find(
			(i) => i.productId === product.id && JSON.stringify(i.choices) === choicesKey
		);
		if (existing) {
			existing.quantity += quantity;
		} else {
			items.push({ productId: product.id, choices, quantity });
		}
	},

	/** Remove by productId (first matching entry) */
	remove(productId: ProductId, quantity = 1): void {
		const idx = items.findIndex((i) => i.productId === productId);
		if (idx === -1) return;
		if (items[idx].quantity > quantity) {
			items[idx].quantity -= quantity;
		} else {
			items.splice(idx, 1);
		}
	},

	increaseAt(index: number, quantity = 1): void {
		if (items[index]) items[index].quantity += quantity;
	},

	removeAt(index: number, quantity = 1): void {
		if (!items[index]) return;
		if (items[index].quantity > quantity) {
			items[index].quantity -= quantity;
		} else {
			items.splice(index, 1);
		}
	},

	clear(): void {
		items = [];
		productCache.clear();
	}
};
