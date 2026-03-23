import { browser } from '$app/environment';
import type { Product } from '$lib/api/types/product';

import { writable, type Writable } from 'svelte/store';

export interface BasketItem {
	product: Product;
	quantity: number;
}

export class Basket {
	private static STORAGE_KEY = 'basket';
	private items: BasketItem[] = [];
	public store: Writable<BasketItem[]>;

	constructor() {
		this.load();

		this.store = writable(this.items);

		this.store.subscribe((items) => {
			this.items = items;
			this.save();
		});
	}

	// --- Public API ---

	add(product: Product, quantity = 1) {
		const existing = this.items.find((item) => item.product.id === product.id);
		if (existing) {
			existing.quantity += quantity;
		} else {
			this.items.push({ product, quantity });
		}
		this.updateStore();
	}

	remove(productId: number, quantity?: number) {
		const existing = this.items.find((item) => item.product.id === productId);
		if (!existing) return;

		if (quantity && quantity < existing.quantity) {
			existing.quantity -= quantity;
		} else {
			this.items = this.items.filter((item) => item.product.id !== productId);
		}

		this.updateStore();
	}

	clear() {
		this.items = [];
		this.updateStore();
	}

	has(productId: number) {
		return this.items.some((item) => item.product.id === productId);
	}

	getTotalPrice(): number {
		return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
	}

	groupByCategory(): Record<number, BasketItem[]> {
		return this.items.reduce((acc: Record<number, BasketItem[]>, item) => {
			const catId = item.product.categoryId;
			if (!acc[catId]) acc[catId] = [];
			acc[catId].push(item);
			return acc;
		}, {});
	}

	getItems(): BasketItem[] {
		return this.items;
	}

	// --- Internal Helpers ---

	private updateStore() {
		this.store.set(this.items);
	}

	private save() {
		try {
			localStorage.setItem(Basket.STORAGE_KEY, JSON.stringify(this.items));
		} catch (err) {
			console.error('Failed to save basket:', err);
		}
	}

	private load() {
		try {
			if (!browser) {
				return null;
			}
			const data = localStorage.getItem(Basket.STORAGE_KEY);
			if (!data) return;
			this.items = JSON.parse(data) as BasketItem[];
		} catch (err) {
			console.error('Failed to load basket:', err);
			this.items = [];
		}
	}
}
