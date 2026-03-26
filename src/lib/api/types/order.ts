export interface CreateOrder {
	pickupTime: number;
	tableNumber: number | null;
	items: CreateOrderItem[];
}

export interface CreateOrderItem {
	productId: number;
	choices: number[];
}
