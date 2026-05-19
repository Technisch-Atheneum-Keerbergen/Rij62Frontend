export type ChefDish = {
	key: string;
	title: string;
	choicesLabel: string;
	totalQuantity: number;
	prepared: number;
	sourceOrders: { label: string; pickupTime: number }[];
	earliestPickup: number;
};
