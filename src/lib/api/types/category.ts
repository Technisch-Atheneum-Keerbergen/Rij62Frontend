import type { MultiLangString } from './multilangstring';

export interface Category {
	id: number;
	name: MultiLangString;
	imgUrl: string;
	rootCategory: string;
}
