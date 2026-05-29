import type { Order, OrderPaymentStatus, OrderStatus } from './order';

export type OrderEvent =
	| {
			type: 'orderAdded';
			order: Order;
	  }
	| {
			type: 'orderItemStatusUpdated';
			orderItemStatus: {
				orderItemId: number;
				status: OrderStatus;
			};
	  }
	| {
			type: 'orderPaymentStatusUpdated';
			paymentStatus: {
				status: OrderPaymentStatus;
				orderId: string;
			};
	  };
