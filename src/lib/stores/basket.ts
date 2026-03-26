// src/lib/stores/basket.ts
import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';
import type { Product } from '$lib/api/types/product';

export interface BasketChoice {
	id: number;
	title: string;
	price: number;
	amount: number;
}

export interface BasketItem {
	product: Product;
	quantity: number;
	choices: BasketChoice[];
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

	subscribe((items) => {
		if (browser) save(items);
	});

	return {
		subscribe,
		add(product: Product, choices: BasketChoice[], quantity = 1) {
			update((items) => {
				items.push({ product, quantity, choices });
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
		increaseAt(index: number, quantity = 1) {
			update((items) => {
				if (items[index]) items[index].quantity += quantity;
				return items;
			});
		},
		removeAt(index: number, quantity = 1) {
			update((items) => {
				if (!items[index]) return items;
				if (items[index].quantity > quantity) {
					items[index].quantity -= quantity;
				} else {
					items.splice(index, 1);
				}
				return items;
			});
		}
	};
}

export const basket = createBasket();

export const basketTotal = derived(basket, ($basket) =>
	$basket.reduce((sum, item) => {
		const choicesPrice = item.choices.reduce((s, c) => s + c.price * c.amount, 0);
		return sum + (item.product.price + choicesPrice) * item.quantity;
	}, 0)
);

export const basketCount = derived(basket, ($basket) =>
	$basket.reduce((sum, item) => sum + item.quantity, 0)
);

export const basketOrderPayload = derived(basket, ($basket) => ({
	items: $basket.map((item) => ({
		productId: item.product.id,
		choices: item.choices
	}))
}));
