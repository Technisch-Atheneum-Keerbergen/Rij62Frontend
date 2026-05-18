<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import AmountController from '$lib/components/Misc/AmountController.svelte';
	import {
		basket,
		getItemTotal,
		type LoadedBasketChoice,
		type LoadedBasketItem
	} from '$lib/stores/basket.svelte';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	let loadedItems = $derived(basket.loadedItems);
	let loading = $derived(basket.loading);
	let error = $derived(basket.error);

	function increase(itemIndex: number) {
		basket.increaseAt(itemIndex);
	}

	function decrease(itemIndex: number) {
		basket.removeAt(itemIndex);
	}

	function remove(itemIndex: number) {
		basket.items.splice(itemIndex, 1);
	}

	function basketTotal(items: LoadedBasketItem[]): number {
		return items.reduce((sum, item) => sum + getItemTotal(item), 0);
	}

	function isItemUnavailable(item: LoadedBasketItem): boolean {
		return !item.product.isAvailable || !item.product.enabledByPreset;
	}

	function containsUnavailableChoice(choices: LoadedBasketChoice[]): boolean {
		let hasUnavailableItems = choices.some((choice) => {
			return !choice.product.isAvailable || !choice.product.enabledByPreset;
		});
		return hasUnavailableItems;
	}

	let hasUnavailableItems = $derived(
		loadedItems.some(isItemUnavailable) ||
			loadedItems.some((item) => {
				return containsUnavailableChoice(item.choices);
			})
	);
</script>

<section class="mx-auto max-w-2xl">
	<h2 class="mb-4 text-center text-xl font-semibold">Your Basket</h2>
	<div class="rounded-3xl bg-100 p-2 shadow-md">
		{#if basket.items.length === 0}
			<p class="py-5 text-center text-lg opacity-60">Your basket is empty.</p>
		{:else if error}
			<p class="py-5 text-center text-lg opacity-60">Failed to load basket. Please try again.</p>
		{:else if loading}
			<p class="py-5 text-center text-lg opacity-60">Loading...</p>
		{:else}
			<ul class="space-y-3">
				{#each loadedItems as item, i (item.product.id + JSON.stringify(item.choices.map((c) => c.product.id)))}
					{@const itemUnavailable = isItemUnavailable(item)}
					{@const anyChoiceUnavailable = containsUnavailableChoice(item.choices)}
					{@const unavailable = itemUnavailable || anyChoiceUnavailable}
					<li
						class="flex items-center justify-between rounded-2xl border-2 bg-200 p-2 shadow-sm transition-all"
						class:border-300={!unavailable}
						class:border-red-300={unavailable}
					>
						<div class="flex items-center gap-3">
							<div class="relative">
								<img
									src={item.product.imgURL}
									alt={item.product.title[currentLanguage]}
									class="h-12 w-12 rounded-lg object-cover transition-all"
								/>
							</div>
							<div>
								<div class="flex flex-col items-start justify-start">
									<p class="font-medium" class:line-through={itemUnavailable}>
										{item.product.title[currentLanguage]}
									</p>
									{#if itemUnavailable}
										<span
											class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-500"
										>
											Unavailable
										</span>
									{:else if anyChoiceUnavailable}
										<span
											class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-500"
										>
											Choices unavailable
										</span>
									{/if}
								</div>
								{#if item.choices.length > 0}
									<p class="text-muted text-xs opacity-80">
										{#each item.choices as choice, i}
											<span
												class:line-through={!choice.product.isAvailable ||
													!choice.product.enabledByPreset}
											>
												{choice.quantity > 1
													? `${choice.product.title[currentLanguage]} x${choice.quantity}`
													: choice.product.title[currentLanguage]}
											</span>
											{#if i < item.choices.length - 1}
												<span class="-ml-0.5">,&nbsp;</span>
											{/if}
										{/each}
									</p>
								{/if}
								<p class="text-muted text-sm">€{getItemTotal(item).toFixed(2)}</p>
							</div>
						</div>
						<AmountController
							id={i}
							{decrease}
							{increase}
							{remove}
							disableIncrease={unavailable}
							currentAmount={item.quantity}
						/>
					</li>
				{/each}
			</ul>
			<hr class="mt-6 mb-3 border-300" />
			{#if hasUnavailableItems}
				<p class="mb-2 text-center text-sm text-red-400">
					Some items in your basket are no longer available. Please remove them to continue.
				</p>
			{/if}
			<div class="flex items-center justify-between p-2 font-semibold">
				<span class="text-muted">Total:</span>
				<span class="text-xl">€{basketTotal(loadedItems).toFixed(2)}</span>
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
			disabled={hasUnavailableItems || basket.items.length === 0}
			onclick={() => (window.location.href = '/checkout')}
		>
			Checkout
		</Button>
	</div>
</section>
