import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { OrderId } from '$lib/api/types/order';

const STORAGE_KEY = 'pendingOrders';

function loadPendingOrders(): OrderId[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw) as OrderId[];
	} catch (err) {
		console.error('Failed to load pending orders:', err);
		return [];
	}
}

function createPendingOrderStore() {
	const { subscribe, update, set } = writable<OrderId[]>(loadPendingOrders());

	subscribe((items) => {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		}
	});

	return {
		subscribe,

		add(order: OrderId) {
			update((items) => {
				items.push(order);
				return items;
			});
		}
	};
}

export const pendingOrderStore = createPendingOrderStore();
