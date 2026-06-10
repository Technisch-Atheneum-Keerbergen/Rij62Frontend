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

export interface BasketData {
	items: BasketItem[];
	comment: string;
}

export function getItemTotal(item: LoadedBasketItem): number {
	const choicesTotal = item.choices.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
	return (item.product.price + choicesTotal) * item.quantity;
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'basket';

function loadFromStorage(): BasketData {
	if (!browser) return { items: [], comment: '' };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) throw 'No basket data in local storage';
		let parsed = JSON.parse(raw) as { items: BasketItem[]; comment: string };
		return parsed;
	} catch (err) {
		console.error('Failed to load basket from storage:', err);
		return { items: [], comment: '' };
	}
}

function saveToStorage(basketData: BasketData): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(basketData));
	} catch (err) {
		console.error('Failed to save basket to storage:', err);
	}
}

// ---------------------------------------------------------------------------
// Core reactive state
// ---------------------------------------------------------------------------
let basketData = $state<BasketData>(loadFromStorage());

$effect.root(() => {
	$effect(() => {
		if (browser) saveToStorage(basketData);
	});
});

// ---------------------------------------------------------------------------
// Derived state
// ---------------------------------------------------------------------------

export function basketCount() {
	return basketData.items.reduce((sum, item) => sum + item.quantity, 0);
}

// ---------------------------------------------------------------------------
// Product cache
// Keyed by productId, stores Promises so concurrent callers share one fetch.
// ---------------------------------------------------------------------------

const productCache = new Map<ProductId, Promise<Product>>();

function createMissingProduct(productId: ProductId): Product {
	return {
		id: productId,
		title: {
			English: 'Unavailable',
			Dutch: 'Niet beschikbaar'
		},
		price: 0,
		stock: 0,
		isAvailable: false,
		enabledByPreset: false,
		description: {
			English: '',
			Dutch: ''
		},
		btw: 0,
		imgURL: '',
		categoryId: null,
		steps: []
	};
}

function fetchProduct(productId: ProductId): Promise<Product> {
	if (!productCache.has(productId)) {
		productCache.set(
			productId,
			apiFetch('/product/' + productId).catch((err: Error) => {
				if (err?.message === 'Not Found') {
					return createMissingProduct(productId);
				}

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
		basketData.items.forEach((i) => i.quantity);
		const snapshot = basketData.items.map((item) => ({
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
		return basketData.items;
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

	get comment(): string {
		return basketData.comment;
	},

	saveComment(comment: string) {
		basketData.comment = comment;
	},

	add(product: Product, choices: BasketChoice[], quantity = 1): void {
		const key = choicesKey(choices);
		const existing = basketData.items.find(
			(i) => i.productId === product.id && choicesKey(i.choices) === key
		);
		if (existing) {
			existing.quantity += quantity;
		} else {
			basketData.items.push({ productId: product.id, choices, quantity });
		}
	},

	remove(productId: ProductId, quantity = 1): void {
		const idx = basketData.items.findIndex((i) => i.productId === productId);
		if (idx === -1) return;
		if (basketData.items[idx].quantity > quantity) {
			basketData.items[idx].quantity -= quantity;
		} else {
			basketData.items.splice(idx, 1);
		}
	},

	increaseAt(index: number, quantity = 1): void {
		if (basketData.items[index]) basketData.items[index].quantity += quantity;
	},

	removeAt(index: number, quantity = 1): void {
		if (!basketData.items[index]) return;
		if (basketData.items[index].quantity > quantity) {
			basketData.items[index].quantity -= quantity;
		} else {
			basketData.items.splice(index, 1);
		}
	},

	clear(): void {
		basketData.items = [];
		basketData.comment = '';
		loadedItemsState = [];
		productCache.clear();
	}
};
