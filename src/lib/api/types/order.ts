import type { UUID } from 'crypto';
import type { MultiLangString } from './multilangstring';
import type { ProductId } from './product';
import type { RootCategory } from './rootCategory';
import type { BasketChoice } from '$lib/stores/basket.svelte';

export interface CreateOrder {
	pickupTime: number;
	tableNumber: number | null;
	items: CreateOrderItem[];
}

export interface CreateOrderItem {
	productId: number;
	quantity: number;
	choices: number[];
}

export type OrderId = UUID;

export type Order = {
	id: OrderId;
	orderNumber: number;
	tableNumber: number | null;
	createdTime: number;
	paymentStatus: OrderPaymentStatus;
	totalPrice: number;
	pickupTime: number;
	items: OrderItem[];
};

export type OrderItem = {
	id: number;
	product: OrderProduct;
	status: OrderStatus;
	choices: { product: OrderProduct }[];
};

export type OrderProduct = {
	productId: ProductId;
	title: MultiLangString;
	description: MultiLangString;
	price: number;
	btw: number;
	rootCategory: RootCategory;
	imgUrl: string;
};

export type OrderStatus = `Pending` | `InProgress` | `Ready` | `PickedUp`;
export type OrderPaymentStatus = 'NotPaid';

export function groupDuplicateIds(ids: number[]): BasketChoice[] {
	const map = new Map<number, number>();

	for (const id of ids) {
		map.set(id, (map.get(id) ?? 0) + 1);
	}
	return Array.from(map.entries()).map(([id, quantity]) => ({
		id,
		quantity
	}));
}

export function groupDuplicateOrderItemChoices(
	orderProducts: { product: { productId: number } }[]
): BasketChoice[] {
	const map = new Map<number, number>();

	for (const item of orderProducts) {
		const id = item.product.productId;

		map.set(id, (map.get(id) ?? 0) + 1);
	}

	return Array.from(map.entries()).map(([id, quantity]) => ({
		id,
		quantity
	}));
}

export function duplicateGroupedIds(items: BasketChoice[]): number[] {
	return items.flatMap((item) => Array.from({ length: item.quantity }, () => item.id));
}

let i: Order = {
	id: 'edc17bf3-f884-4009-98f2-4b205227a45d',
	tableNumber: null,
	orderNumber: 8,
	createdTime: 1779393758,
	totalPrice: 50,
	pickupTime: 1779396153,
	paymentStatus: 'NotPaid',
	items: [
		{
			id: 9,
			product: {
				productId: 5,
				title: {
					English: 'Croque ham/kaas',
					Dutch: 'Croque ham/cheese'
				},
				description: {
					English: 'Huisgemaakt brood, ketchup & mayo',
					Dutch: 'Homemade bread, ketchup & mayo'
				},
				price: 8.0,
				btw: 21,
				imgUrl: 'http://localhost:5148/api/image/4061ea5c-d341-483f-bce6-4750f4b750d2',
				rootCategory: 'Food'
			},
			status: 'Pending',

			choices: [
				{
					product: {
						productId: 23,
						title: {
							English: 'Ketchup',
							Dutch: 'Ketchup'
						},
						description: {
							English: '',
							Dutch: ''
						},
						price: 0,
						btw: 21,
						imgUrl: 'http://localhost:5148/api/image/35fe8882-d8cb-4a0e-a896-a2b06b63d1b8',
						rootCategory: 'Food'
					}
				}
			]
		},
		{
			id: 10,
			product: {
				productId: 6,
				title: {
					English: 'Croque met 2 kazen',
					Dutch: 'Croque with 2 cheeses'
				},
				description: {
					English: 'Gouda & cheddar',
					Dutch: 'Gouda & cheddar'
				},
				price: 8.0,
				btw: 21,
				imgUrl: 'http://localhost:5148/api/image/4061ea5c-d341-483f-bce6-4750f4b750d2',
				rootCategory: 'Food'
			},
			status: 'Pending',

			choices: []
		},
		{
			id: 11,
			product: {
				productId: 3,
				title: {
					English: 'Zoete aardappel frietjes',
					Dutch: 'Sweet potato fries'
				},
				description: {
					English: 'Met mayo',
					Dutch: 'With mayo'
				},
				price: 8.9,
				btw: 21,
				imgUrl: 'http://localhost:5148/api/image/ac47e261-d0e6-4e17-bc79-2be72aaf105d',
				rootCategory: 'Food'
			},
			status: 'Pending',

			choices: []
		},
		{
			id: 12,
			product: {
				productId: 56,
				title: {
					English: 'Verse Munt',
					Dutch: 'Fresh Mint'
				},
				description: {
					English: 'Puur',
					Dutch: 'Pure'
				},
				price: 5.0,
				btw: 21,
				imgUrl: 'http://localhost:5148/api/image/2a52beec-0f18-4278-b6a3-c5a9dc0b0f90',
				rootCategory: 'Drinks'
			},
			status: 'Pending',

			choices: []
		},
		{
			id: 13,
			product: {
				productId: 59,
				title: {
					English: 'Passievrucht Thee',
					Dutch: 'Passion Fruit Tea'
				},
				description: {
					English: 'Passievrucht-puree, citroen, zwarte thee, munt',
					Dutch: 'Passion fruit puree, lemon, black tea, mint'
				},
				price: 5.0,
				btw: 21,
				imgUrl: 'http://localhost:5148/api/image/2a52beec-0f18-4278-b6a3-c5a9dc0b0f90',
				rootCategory: 'Drinks'
			},
			status: 'Pending',

			choices: []
		},
		{
			id: 14,
			product: {
				productId: 27,
				title: {
					English: 'Doppio',
					Dutch: 'Doppio'
				},
				description: {
					English: '',
					Dutch: ''
				},
				price: 3.5,
				btw: 21,
				imgUrl: 'http://localhost:5148/api/image/45842ac3-02cb-4960-b72b-c6998a329be1',
				rootCategory: 'Drinks'
			},
			status: 'Pending',

			choices: []
		}
	]
};
