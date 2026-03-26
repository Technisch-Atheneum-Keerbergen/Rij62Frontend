import type { ProductStep } from '$lib/api/types/productstep';

// stepState.svelte.ts
export type OptionState = {
	id: number;
	selected: boolean;
	amount: number;
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
		options: step.options.map((opt) => ({
			id: opt.id,
			selected: opt.id === step.defaultOptionId,
			amount: opt.id === step.defaultOptionId ? 1 : 0
		}))
	}));
}

export function toggleOption(stepState: StepState, optionId: number, price: number) {
	const opt = stepState.options.find((o) => o.id === optionId)!;

	if (stepState.multipleChoice) {
		if (opt.selected && price > 0) return;

		opt.selected = !opt.selected;
		opt.amount = opt.selected && price > 0 ? 1 : 0;
	} else {
		if (opt.selected && price > 0) return;

		const wasSelected = opt.selected;

		for (const o of stepState.options) {
			o.selected = false;
			o.amount = 0;
		}

		if (!wasSelected) {
			opt.selected = true;
			opt.amount = price > 0 ? 1 : 0;
		}
	}
}

export function changeAmount(stepState: StepState, optionId: number, delta: number) {
	const opt = stepState.options.find((o) => o.id === optionId)!;
	const next = opt.amount + delta;
	if (next <= 0) {
		opt.amount = 0;
		opt.selected = false;
	} else {
		opt.amount = next;
	}
}
