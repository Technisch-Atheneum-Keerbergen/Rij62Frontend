<script lang="ts">
	import SvgMinus from '../SVG/SvgMinus.svelte';
	import SvgPlus from '../SVG/SvgPlus.svelte';

	type Props = {
		decrease: (value?: any) => void;
		increase: (value?: any) => void;
		currentAmount: number;
		id?: any;
	};

	let props: Props = $props();

	const currentAmount = $derived(props.currentAmount);

	function handleDecrease() {
		props.decrease(props.id);
	}

	function handleIncrease() {
		props.increase(props.id);
	}
</script>

<div class="flex items-center gap-2 text-lg">
	<button
		class="cursor-pointer rounded-md transition-all active:scale-95 active:bg-100"
		onclick={(e) => {
			e.stopPropagation();
			handleDecrease();
		}}
	>
		<div class="stroke-main aspect-square h-full max-h-6">
			<SvgMinus />
		</div>
	</button>

	<span class="rounded-md bg-100 px-2">{currentAmount}</span>

	<button
		class="cursor-pointer rounded-md transition-all active:scale-95 active:bg-100"
		onclick={(e) => {
			e.stopPropagation();
			handleIncrease();
		}}
	>
		<div class="stroke-main aspect-square h-full max-h-6">
			<SvgPlus />
		</div>
	</button>
</div>
