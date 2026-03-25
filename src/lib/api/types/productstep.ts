import type { MultiLangString } from './multilangstring';
import type { Product } from './product';

export interface ProductStep {
	id: number;
	title: MultiLangString;
	multipleChoice: boolean;
	defaultOptionId: number | null;
	options: Product[];
}
