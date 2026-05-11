<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import AmountController from '$lib/components/Misc/AmountController.svelte';
	import { basket, getItemTotal, type LoadedBasketItem } from '$lib/stores/basket.svelte';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	// Derived directly from the store's stable state — no $effect needed
	let resolvedItems = $derived(basket.loadedItems);
	let loading = $derived(basket.loading);
	let error = $derived(basket.error);

	function increase(itemIndex: number) {
		basket.increaseAt(itemIndex);
	}

	function decrease(itemIndex: number) {
		basket.removeAt(itemIndex);
	}

	function basketTotal(items: LoadedBasketItem[]): number {
		return items.reduce((sum, item) => sum + getItemTotal(item), 0);
	}
</script>

<section class="mx-auto max-w-2xl">
	<h2 class="mb-4 text-center text-xl font-semibold">Your Basket</h2>
	<div class="rounded-2xl bg-100 p-2 shadow-md">
		{#if basket.items.length === 0}
			<p class="py-5 text-center text-lg opacity-60">Your basket is empty.</p>
		{:else if error}
			<p class="py-5 text-center text-lg opacity-60">Failed to load basket. Please try again.</p>
		{:else if loading}
			<p class="py-5 text-center text-lg opacity-60">Loading...</p>
		{:else}
			<ul class="space-y-3">
				{#each resolvedItems as item, i (item.product.id + JSON.stringify(item.choices.map((c) => c.product.id)))}
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
								{#if item.choices.length > 0}
									<p class="text-muted text-xs opacity-80">
										{item.choices
											.map((c) =>
												c.quantity > 1
													? `${c.product.title[currentLanguage]} x${c.quantity}`
													: c.product.title[currentLanguage]
											)
											.join(', ')}
									</p>
								{/if}
								<p class="text-muted text-sm">€{getItemTotal(item).toFixed(2)}</p>
							</div>
						</div>
						<AmountController id={i} {decrease} {increase} currentAmount={item.quantity} />
					</li>
				{/each}
			</ul>
			<hr class="mt-6 mb-3 border-300" />
			<div class="flex items-center justify-between p-2 font-semibold">
				<span class="text-muted">Total:</span>
				<span class="text-xl">€{basketTotal(resolvedItems).toFixed(2)}</span>
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
</section>
