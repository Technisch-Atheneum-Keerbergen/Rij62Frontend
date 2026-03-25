import type { MultiLangString } from './multilangstring';
import type { ProductStep } from './productstep';

export interface Product {
	id: number;
	title: MultiLangString;
	price: number;
	stock: number;
	isAvailable: boolean;
	description: MultiLangString;
	btw: number;
	imgURL: string;
	categoryId: number;
	steps: ProductStep[];
}
