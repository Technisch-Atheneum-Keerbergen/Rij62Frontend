// src/lib/stores/basket.ts
import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';
import type { Product } from '$lib/api/types/product';

export interface BasketItem {
	product: Product;
	quantity: number;
}

const STORAGE_KEY = 'basket';

function load(): BasketItem[] {
	if (!browser) return [];

	try {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch (err) {
		console.error('Failed to load basket:', err);
		return [];
	}
}

function save(items: BasketItem[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch (err) {
		console.error('Failed to save basket:', err);
	}
}

function createBasket() {
	const { subscribe, update, set } = writable<BasketItem[]>(load());

	// persist automatically
	subscribe((items) => {
		if (browser) save(items);
	});

	return {
		subscribe,

		add(product: Product, quantity = 1) {
			update((items) => {
				const existing = items.find((i) => i.product.id === product.id);

				if (existing) {
					existing.quantity += quantity;
				} else {
					items.push({ product, quantity });
				}

				return items;
			});
		},

		remove(productId: number, quantity = 1) {
			update((items) => {
				const existing = items.find((i) => i.product.id === productId);
				if (!existing) return items;

				if (existing.quantity > quantity) {
					existing.quantity -= quantity;
				} else {
					items = items.filter((i) => i.product.id !== productId);
				}

				return items;
			});
		},

		clear() {
			set([]);
		},

		has(productId: number) {
			let found = false;
			update((items) => {
				found = items.some((i) => i.product.id === productId);
				return items;
			});
			return found;
		}
	};
}

export const basket = createBasket();

export const basketTotal = derived(basket, ($basket) =>
	$basket.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
);

export const basketCount = derived(basket, ($basket) =>
	$basket.reduce((sum, item) => sum + item.quantity, 0)
);
