export type UrgencyLevel = 'red' | 'yellow' | 'green';

export interface ChefDish {
	key: string; // dish key + urgency bucket e.g. "Hummus||Sauce::red"
	dishKey: string; // base dish key without urgency suffix
	title: string;
	choicesLabel: string;
	totalQuantity: number;
	prepared: number;
	sourceOrders: { label: string; pickupTime: number }[];
	earliestPickup: number;
	urgency: UrgencyLevel;
	rootCategory: 'Food' | 'Drinks' | string;
}
