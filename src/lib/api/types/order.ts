import type { MultiLangString } from './multilangstring';

export interface CreateOrder {
	pickupTime: number;
	tableNumber: number | null;
	items: CreateOrderItem[];
}

export interface CreateOrderItem {
	productId: number;
	choices: number[];
}

export type OrderId = number;

export type OrderStatus = `Pending` | `InProgress` | `Ready` | `PickedUp`;

export type OrderItem = {
	id: number;
	title: MultiLangString;
	description: MultiLangString;
	status: OrderStatus;
	price: number;
	imgUrl: string;
	btw: number;
	choices: number[];
};

export interface Order {
	id: OrderId;
	tableNumber: number;
	createdTime: number;
	pickupTime: null;
	items: OrderItem[];
}
