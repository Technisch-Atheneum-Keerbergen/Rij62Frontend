<script lang="ts">
	import AmountController from '$lib/components/Misc/AmountController.svelte';
	import SvgImage from '../SVG/SvgImage.svelte';
	import Image from '../Misc/Image.svelte';

	let {
		title = '',
		imageSrc = '',
		alt = 'Card image',
		class: className = '',
		size = 'md',
		selectable = false,
		selected = false,
		disabled = false,
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
		disabled?: boolean;
		amount?: number;
		price?: number;
		ontoggle?: () => void;
		onamount?: (delta: number) => void;
		onclick?: () => void;
	} = $props();

	const divSizeStyle = {
		sm: 'max-w-30 min-w-30',
		md: 'max-w-42 min-w-42',
		lg: 'max-w-48 min-w-48'
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
	tabindex={disabled ? -1 : 0}
	onclick={!disabled ? handleClick : undefined}
	onkeydown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && handleClick()}
	class="flex {divSizeStyle[size]} relative h-fit cursor-pointer touch-manipulation flex-col
        overflow-hidden rounded-3xl border-2 shadow-sm transition-all
        {selectable && selected ? 'border-primary-300 bg-200' : 'border-300 bg-100'}
        {disabled
		? 'pointer-events-none cursor-not-allowed opacity-50 grayscale'
		: 'cursor-pointer hover:shadow-md active:scale-95'}
        {className}"
>
	<div class="relative aspect-5/4 h-full w-full overflow-hidden">
		<Image src={imageSrc} {alt} class="aspect-5/4 w-full" />

		<div class="absolute bottom-0 h-[55%] w-full">
			<div
				class="absolute inset-0 backdrop-blur-md"
				style="mask-image: linear-gradient(to bottom, transparent, black); -webkit-mask-image: linear-gradient(to bottom, transparent, black);"
			></div>
			<div class="absolute inset-0 bg-linear-to-b/oklch from-transparent to-black/80"></div>
			<div class="relative flex h-full flex-col justify-end px-2 pb-1.5">
				<h3 class="truncate text-center text-sm font-semibold text-light">{title}</h3>
				{#if price > 0}
					<p class="text-center text-xs text-white/70">€{price.toFixed(2)}</p>
				{/if}
			</div>
		</div>
	</div>

	{#if showAmount}
		<div
			role="none"
			class="flex justify-center py-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<AmountController
				currentAmount={amount}
				decrease={() => onamount?.(-1)}
				increase={() => onamount?.(1)}
			/>
		</div>
	{/if}
</div>
