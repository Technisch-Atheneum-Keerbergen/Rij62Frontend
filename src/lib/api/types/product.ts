import type { MultiLangString } from './multilangstring';
import type { ProductStep } from './productstep';
export type ProductId = number;

export interface Product {
	id: ProductId;
	title: MultiLangString;
	price: number;
	stock: number;
	isAvailable: boolean;
	enabledByPreset: boolean;
	description: MultiLangString;
	btw: number;
	imgURL: string;
	categoryId: number;
	steps: ProductStep[];
}

export function productIsAvailable(product: Product) {
	return product.isAvailable && product.enabledByPreset;
}
