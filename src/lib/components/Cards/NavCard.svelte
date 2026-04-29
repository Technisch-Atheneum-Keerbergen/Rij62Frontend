<script lang="ts">
	import SvgChevronRight from './../SVG/SvgChevronRight.svelte';
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
		sm: 'max-h-20 min-h-20',
		md: 'max-h-25 min-h-25',
		lg: 'max-h-35 min-h-35'
	};

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
	]} h-fit cursor-pointer flex-col overflow-hidden rounded-3xl p-1 shadow-sm transition-all
        {selectable && selected ? 'border-primary-300 bg-300' : 'border-300 bg-200'}
        hover:shadow-md active:scale-95 {className}"
>
	{#if imageSrc}
		<img src={imageSrc} {alt} class="{imgSizeStyle[size]} w-full rounded-[20px] object-cover" />
	{/if}

	<div
		class="relative m-1 mt-2 flex h-full flex-col justify-between rounded-full border border-400/50 bg-300 px-2 py-0.5"
	>
		<div class=" flex h-full flex-row items-center">
			<h3 class="max-w-[85%] min-w-0 truncate text-center text-sm font-semibold">
				{title}
			</h3>
			<span class="stroke-main absolute right-1 aspect-square h-6">
				<SvgChevronRight />
			</span>
		</div>
	</div>
</div>
