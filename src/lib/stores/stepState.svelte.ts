import { productIsAvailable } from '$lib/api/types/product';
import type { ProductStep } from '$lib/api/types/productstep';

export type OptionState = {
	id: number;
	selected: boolean;
	quantity: number;
};

export type StepState = {
	stepId: number;
	multipleChoice: boolean;
	options: OptionState[];
};

export function createStepStates(steps: ProductStep[]): StepState[] {
	return steps.map((step) => ({
		stepId: step.id,
		multipleChoice: step.multipleChoice,
		options: step.options.map((product) => ({
			id: product.id,
			selected: product.id === step.defaultOptionId && productIsAvailable(product),
			quantity: product.id === step.defaultOptionId && productIsAvailable(product) ? 1 : 0
		}))
	}));
}

export function toggleOption(stepState: StepState, optionId: number, price: number) {
	const opt = stepState.options.find((o) => o.id === optionId)!;

	if (stepState.multipleChoice) {
		if (opt.selected && price > 0) return;

		opt.selected = !opt.selected;
		opt.quantity = opt.selected && price > 0 ? 1 : 0;
	} else {
		if (opt.selected && price > 0) return;

		const wasSelected = opt.selected;

		for (const o of stepState.options) {
			o.selected = false;
			o.quantity = 0;
		}

		if (!wasSelected) {
			opt.selected = true;
			opt.quantity = price > 0 ? 1 : 0;
		}
	}
}

export function changeAmount(stepState: StepState, optionId: number, delta: number) {
	const opt = stepState.options.find((o) => o.id === optionId)!;
	const next = opt.quantity + delta;
	if (next <= 0) {
		opt.quantity = 0;
		opt.selected = false;
	} else {
		opt.quantity = next;
	}
}
