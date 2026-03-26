<script lang="ts">
	import { slide } from 'svelte/transition';
	import AmountController from '$lib/components/Misc/AmountController.svelte';

	let {
		title = '',
		imageSrc = '',
		alt = 'Card image',
		class: className = '',
		size = 'md',
		selectable = false,
		selected = false,
		amount = 0,
		price = 0,
		ontoggle,
		onamount,
		onclick,
		...restProps
	}: {
		title?: string;
		imageSrc?: string;
		alt?: string;
		class?: string;
		size?: 'sm' | 'md' | 'lg';
		selectable?: boolean;
		selected?: boolean;
		amount?: number;
		price?: number;
		ontoggle?: () => void;
		onamount?: (delta: number) => void;
		onclick?: () => void;
	} = $props();

	const divSizeStyle = {
		sm: 'max-w-30 min-w-30',
		md: 'max-w-40 min-w-40',
		lg: 'max-w-48 min-w-48'
	};
	const imgSizeStyle = {
		sm: 'max-h-14 min-h-14',
		md: 'max-h-20 min-h-20',
		lg: 'max-h-30 min-h-30'
	};

	const showAmount = $derived(selected && price > 0);

	function handleClick() {
		if (selectable) ontoggle?.();
		else onclick?.();
	}
</script>

<div
	{...restProps}
	role="button"
	transition:slide={{ duration: 200 }}
	tabindex="0"
	onclick={handleClick}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
	class="flex {divSizeStyle[
		size
	]} h-fit cursor-pointer flex-col overflow-hidden rounded-3xl border-2 p-1 shadow-sm transition-all
        {selectable && selected ? 'border-primary-300 bg-300' : 'border-300 bg-200'}
        hover:shadow-md active:scale-95 {className}"
>
	{#if imageSrc}
		<img src={imageSrc} {alt} class="{imgSizeStyle[size]} w-full rounded-2xl object-cover" />
	{/if}

	<div class="flex h-full flex-col items-center justify-between pt-1">
		<div class="flex h-full flex-col items-center">
			<h3 class="text-center text-xs font-semibold">{title}</h3>

			{#if price > 0}
				<p class="text-muted w-full text-center text-sm">€{price.toFixed(2)}</p>
			{/if}
		</div>

		{#if showAmount}
			<div
				role="none"
				class="mt-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<div class="mb-0.5">
					<AmountController
						currentAmount={amount}
						decrease={() => onamount?.(-1)}
						increase={() => onamount?.(1)}
					/>
				</div>
			</div>
		{/if}
	</div>
</div>
