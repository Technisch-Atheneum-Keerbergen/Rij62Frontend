import type { UUID } from 'crypto';
import type { MultiLangString } from './multilangstring';
import type { ProductId } from './product';
import type { RootCategory } from './rootCategory';

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
	tableNumber: number | null;
	createdTime: number;
	pickupTime: number;
	items: OrderItem[];
};

export type OrderItem = {
	id: number;
	product: OrderProduct;
	status: OrderStatus;
	quantity: number;
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

let i: Order = {
	id: 'daad4b7a-cd4d-493e-aaea-b1f442804fcc',
	tableNumber: null,
	createdTime: 1779140925,
	pickupTime: 1779140925,
	items: [
		{
			id: 2,
			product: {
				productId: 5,
				title: {
					English: 'Croque ham/kaas',
					Dutch: 'Croque ham/cheese'
				},
				rootCategory: 'Food',
				description: {
					English: 'Huisgemaakt brood, ketchup & mayo',
					Dutch: 'Homemade bread, ketchup & mayo'
				},
				price: 8,
				btw: 21,
				imgUrl: 'http://localhost:5148/api/image/4061ea5c-d341-483f-bce6-4750f4b750d2'
			},
			status: 'Pending',
			quantity: 1,
			choices: [
				{
					product: {
						productId: 5,
						title: {
							English: 'Croque ham/kaas',
							Dutch: 'Croque ham/cheese'
						},
						rootCategory: 'Food',
						description: {
							English: 'Huisgemaakt brood, ketchup & mayo',
							Dutch: 'Homemade bread, ketchup & mayo'
						},
						price: 8,
						btw: 21,
						imgUrl: 'http://localhost:5148/api/image/4061ea5c-d341-483f-bce6-4750f4b750d2'
					}
				},
				{
					product: {
						productId: 5,
						title: {
							English: 'Croque ham/kaas',
							Dutch: 'Croque ham/cheese'
						},
						rootCategory: 'Food',
						description: {
							English: 'Huisgemaakt brood, ketchup & mayo',
							Dutch: 'Homemade bread, ketchup & mayo'
						},
						price: 8,
						btw: 21,
						imgUrl: 'http://localhost:5148/api/image/4061ea5c-d341-483f-bce6-4750f4b750d2'
					}
				},
				{
					product: {
						productId: 5,
						title: {
							English: 'Croque ham/kaas',
							Dutch: 'Croque ham/cheese'
						},
						rootCategory: 'Food',
						description: {
							English: 'Huisgemaakt brood, ketchup & mayo',
							Dutch: 'Homemade bread, ketchup & mayo'
						},
						price: 8,
						btw: 21,
						imgUrl: 'http://localhost:5148/api/image/4061ea5c-d341-483f-bce6-4750f4b750d2'
					}
				},
				{
					product: {
						productId: 5,
						title: {
							English: 'Croque ham/kaas',
							Dutch: 'Croque ham/cheese'
						},
						rootCategory: 'Food',
						description: {
							English: 'Huisgemaakt brood, ketchup & mayo',
							Dutch: 'Homemade bread, ketchup & mayo'
						},
						price: 8,
						btw: 21,
						imgUrl: 'http://localhost:5148/api/image/4061ea5c-d341-483f-bce6-4750f4b750d2'
					}
				}
			]
		}
	]
};
