import type { MultiLangString } from './multilangstring';

export interface Product {
	id: number;
	title: MultiLangString;
	price: number;
	stock: number;
	isAvailible: boolean;
	imgURL: string;
	categoryId: number;
}
