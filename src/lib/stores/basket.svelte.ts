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

export interface BasketItem {
	productId: ProductId;
	quantity: number;
	choices: BasketChoice[];
}

export interface LoadedBasketChoice {
	product: Product;
	quantity: number;
}

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
// Core reactive state
// ---------------------------------------------------------------------------

let items = $state<BasketItem[]>(loadFromStorage());

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
				productCache.delete(productId);
				throw err;
			})
		);
	}
	return productCache.get(productId)!;
}

// ---------------------------------------------------------------------------
// Stable loaded items state
// ---------------------------------------------------------------------------

let loadedItemsState = $state<LoadedBasketItem[]>([]);
let loadedItemsLoading = $state(true);
let loadedItemsError = $state(false);

function choicesKey(choices: BasketChoice[]): string {
	return JSON.stringify(choices.map((c) => ({ id: c.id, quantity: c.quantity })));
}

function loadedChoicesKey(choices: LoadedBasketChoice[]): string {
	return JSON.stringify(choices.map((c) => ({ id: c.product.id, quantity: c.quantity })));
}

async function syncLoadedItems(snapshot: BasketItem[]): Promise<void> {
	loadedItemsError = false;

	// Remove items no longer in the basket
	for (let i = loadedItemsState.length - 1; i >= 0; i--) {
		const loaded = loadedItemsState[i];
		const stillExists = snapshot.find(
			(s) =>
				s.productId === loaded.product.id &&
				choicesKey(s.choices) === loadedChoicesKey(loaded.choices)
		);
		if (!stillExists) {
			loadedItemsState.splice(i, 1);
		} else {
			loadedItemsState[i].quantity = stillExists.quantity;
		}
	}

	const newItems = snapshot.filter(
		(s) =>
			!loadedItemsState.find(
				(l) => l.product.id === s.productId && loadedChoicesKey(l.choices) === choicesKey(s.choices)
			)
	);

	if (newItems.length === 0) {
		loadedItemsLoading = false;
		return;
	}

	loadedItemsLoading = true;

	try {
		const fetched = await Promise.allSettled(
			newItems.map(async (item): Promise<LoadedBasketItem> => {
				const [product, ...choiceProducts] = await Promise.all([
					fetchProduct(item.productId),
					...item.choices.map((c) => fetchProduct(c.id))
				]);

				return {
					product,
					quantity: item.quantity,
					choices: choiceProducts.map((cp, i) => ({
						product: cp,
						quantity: item.choices[i].quantity
					}))
				};
			})
		);

		fetched
			.filter((r): r is PromiseFulfilledResult<LoadedBasketItem> => r.status === 'fulfilled')
			.forEach((r) => loadedItemsState.push(r.value));
	} catch {
		loadedItemsError = true;
	} finally {
		loadedItemsLoading = false;
	}
}

$effect.root(() => {
	$effect(() => {
		// Touch quantities so Svelte tracks deep mutations
		items.forEach((i) => i.quantity);
		const snapshot = items.map((item) => ({
			productId: item.productId,
			quantity: item.quantity,
			choices: item.choices.map((c) => ({ id: c.id, quantity: c.quantity }))
		}));
		syncLoadedItems(snapshot);
	});
});

// ---------------------------------------------------------------------------
// Basket
// ---------------------------------------------------------------------------

export const basket = {
	get items(): BasketItem[] {
		return items;
	},

	get loadedItems(): LoadedBasketItem[] {
		return loadedItemsState;
	},

	get loading(): boolean {
		return loadedItemsLoading;
	},

	get error(): boolean {
		return loadedItemsError;
	},

	add(product: Product, choices: BasketChoice[], quantity = 1): void {
		const key = choicesKey(choices);
		const existing = items.find((i) => i.productId === product.id && choicesKey(i.choices) === key);
		if (existing) {
			existing.quantity += quantity;
		} else {
			items.push({ productId: product.id, choices, quantity });
		}
	},

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
		loadedItemsState = [];
		productCache.clear();
	}
};
