<script lang="ts">
	import { slide } from 'svelte/transition';
	import { changeAmount, toggleOption, type StepState } from '$lib/stores/stepState.svelte';
	import Card from '../Cards/Card.svelte';

	let {
		step,
		state,
		language = 'English'
	}: {
		step: any;
		state: StepState;
		language?: string;
	} = $props();
</script>

<div class="my-1.5 flex flex-row gap-1.5" transition:slide={{ duration: 200 }}>
	{#each step.options as option}
		{@const optState = state.options.find((o) => o.id === option.id)!}
		<Card
			size="sm"
			title={option.title[language]}
			imageSrc={option.imgURL}
			price={option.price}
			selected={optState.selected}
			amount={optState.amount}
			selectable={true}
			ontoggle={() => toggleOption(state, option.id, option.price)}
			onamount={(delta) => changeAmount(state, option.id, delta)}
		/>
	{/each}
</div>
