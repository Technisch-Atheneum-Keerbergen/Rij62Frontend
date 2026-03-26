import { writable } from 'svelte/store';
import type { BasketItem } from './basket';
import type { Product } from '$lib/api/types/product';
import { browser } from '$app/environment';

export type Order = {
	id: number;
};

const STORAGE_KEY = 'pendingOrders';

function loadPendingOrders(): Order[] {
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch (err) {
		console.error('Failed to load pending orders:', err);
		return [];
	}
}

function createPendingOrderStore() {
	const { subscribe, update, set } = writable<Order[]>(loadPendingOrders());

	// persist automatically
	subscribe((items) => {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		}
	});

	return {
		subscribe,

		add(order: Order) {
			update((items) => {
				items.push(order);
				return items;
			});
		}
	};
}

export const pendingOrderStore = createPendingOrderStore();
