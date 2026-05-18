<script lang="ts">
	import SvgBin from '../SVG/SvgBin.svelte';
	import SvgMinus from '../SVG/SvgMinus.svelte';
	import SvgPlus from '../SVG/SvgPlus.svelte';

	let {
		disabled = false,
		disableIncrease = false,
		currentAmount = 0,
		decrease = () => {},
		increase = () => {},
		remove = () => {},
		...restProps
	}: {
		decrease: (value?: any) => void;
		increase: (value?: any) => void;
		remove?: (value?: any) => void;
		currentAmount: number;
		disabled?: boolean;
		disableIncrease?: boolean;
		id?: any;
	} = $props();

	let increaseDisabled = $derived(disabled || disableIncrease);

	function handleDecrease() {
		if (disabled) return;
		decrease(restProps.id);
	}
	function handleIncrease() {
		if (increaseDisabled) return;
		increase(restProps.id);
	}
	function handleRemove() {
		if (disabled) return;
		remove(restProps.id);
	}
</script>

<div class="flex items-center gap-2 text-lg">
	<button
		class="rounded-md transition-all"
		class:cursor-pointer={!disabled}
		class:cursor-not-allowed={disabled}
		class:opacity-40={disabled}
		class:active:scale-95={!disabled}
		class:active:bg-100={!disabled}
		{disabled}
		onclick={(e) => {
			e.stopPropagation();
			if (disableIncrease) handleRemove();
			else handleDecrease();
		}}
	>
		<div class="stroke-main aspect-square h-6 w-6">
			{#if currentAmount == 1 || disableIncrease}
				<span class="stroke-red-400">
					<SvgBin />
				</span>
			{:else}
				<SvgMinus />
			{/if}
		</div>
	</button>

	<span class="rounded-md bg-100 px-2">{currentAmount}</span>

	<button
		class="rounded-md transition-all"
		class:cursor-pointer={!increaseDisabled}
		class:cursor-not-allowed={increaseDisabled}
		class:opacity-40={increaseDisabled}
		class:active:scale-95={!increaseDisabled}
		class:active:bg-100={!increaseDisabled}
		disabled={increaseDisabled}
		onclick={(e) => {
			e.stopPropagation();
			handleIncrease();
		}}
	>
		<div class="stroke-main aspect-square h-6 w-6">
			<SvgPlus />
		</div>
	</button>
</div>
