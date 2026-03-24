<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { basket, basketTotal } from '$lib/stores/basket';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	const pending = new Set<number>();

	function withGuard(itemId: number, fn: () => void) {
		if (pending.has(itemId)) return;
		pending.add(itemId);
		fn();
		setTimeout(() => pending.delete(itemId), 100);
	}

	function increase(itemId: number) {
		withGuard(itemId, () => {
			const item = $basket.find((i) => i.product.id === itemId);
			if (item) basket.add(item.product, 1);
		});
	}

	function decrease(itemId: number) {
		withGuard(itemId, () => {
			basket.remove(itemId, 1);
		});
	}
</script>

<h2 class="mb-4 text-center text-xl font-semibold">Your Basket</h2>

<div class="max-w-md rounded-2xl bg-100 p-2 shadow-md">
	{#if $basket.length === 0}
		<p class="py-5 text-center text-lg opacity-60">Your basket is empty.</p>
	{:else}
		<ul class="space-y-3">
			{#each $basket as item (item.product.id)}
				<li
					class="flex items-center justify-between rounded-2xl border-2 border-300 bg-200 p-2 shadow-sm"
				>
					<div class="flex items-center gap-3">
						<img
							src={item.product.imgURL}
							alt={item.product.title[currentLanguage]}
							class="h-12 w-12 rounded-lg object-cover"
						/>
						<div>
							<p class="font-medium">{item.product.title[currentLanguage]}</p>
							<p class="text-sm opacity-70">
								€{(item.product.price * item.quantity).toFixed(2)}
							</p>
						</div>
					</div>

					<div class="flex items-center gap-2 text-lg">
						<button
							class="cursor-pointer rounded-md px-2 transition-all active:scale-95 active:bg-100"
							onclick={(e) => {
								e.stopPropagation();
								decrease(item.product.id);
							}}
						>
							-
						</button>

						<span class="rounded-md bg-100 px-2">{item.quantity}</span>

						<button
							class="cursor-pointer rounded-md px-2 transition-all active:scale-95 active:bg-100"
							onclick={(e) => {
								e.stopPropagation();
								increase(item.product.id);
							}}
						>
							+
						</button>
					</div>
				</li>
			{/each}
		</ul>

		<hr class="mt-6 mb-3 border-300" />

		<div class="flex items-center justify-between p-2 font-semibold">
			<span class="text-muted">Total:</span>
			<span class="text-xl">€{$basketTotal.toFixed(2)}</span>
		</div>
	{/if}
</div>

<div class="mt-5 flex w-full items-stretch justify-stretch space-x-1.5">
	<Button class="flex-1" variant="ghost" size="sm" onclick={() => (window.location.href = '/')}>
		Continue shopping
	</Button>

	<Button
		class="flex-1 py-1.5"
		size="sm"
		variant="primary"
		onclick={() => (window.location.href = '/checkout')}
	>
		Checkout
	</Button>
</div>
