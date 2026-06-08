<script lang="ts">
	import { duplicateGroupedIds } from '$lib/api/types/order';
	import TimePicker from '$lib/components/Basket/TimePicker.svelte';
	import Button from '$lib/components/Button.svelte';
	import AmountController from '$lib/components/Misc/AmountController.svelte';
	import OrderCommentField from '$lib/components/Misc/OrderCommentField.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { basket, getItemTotal, type LoadedBasketItem } from '$lib/stores/basket.svelte';
	import { pendingOrderStore } from '$lib/stores/pendingOrders';
	import { tableNumberStore } from '$lib/stores/tableNumber.svelte';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';
	const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

	// ─── Basket state ────────────────────────────────────────────────────────────
	let loadedItems = $derived(basket.loadedItems);
	let orderComment = $state(basket.comment);

	function increase(itemIndex: number) {
		if (basket.items[itemIndex]?.quantity < 50) {
			basket.increaseAt(itemIndex);
		}
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

	// ─── Validation ──────────────────────────────────────────────────────────────
	type ValidationError = {
		product: {
			id: number;
			index: number;
		} | null;
		choiceProduct: {
			id: number;
			index: number;
		} | null;
		type: ValidationErrorType;
	};

	type ValidationErrorType =
		| 'InvalidTableNumber'
		| 'QuantityRange'
		| 'InvalidProduct'
		| 'ProductInactiveOrDisabled'
		| 'PastPickupTime'
		| 'PickupTimeTooFar'
		| 'EmptyOrder';

	const errorMessages: Record<ValidationErrorType, string> = {
		InvalidTableNumber: "This table doesn't exist — check your table number.",
		QuantityRange: 'Quantity must be between 1 and 50.',
		InvalidProduct: 'This item is no longer in the menu.',
		ProductInactiveOrDisabled: 'Item unavailable',
		PastPickupTime: 'Your scheduled time has passed — please update it.',
		PickupTimeTooFar: "You can't schedule more than 7 days ahead.",
		EmptyOrder: 'Your basket is empty.'
	};

	let validationErrors = $state<ValidationError[]>([]);
	let validating = $state(false);

	function getOrderErrors() {
		return validationErrors.filter((e) => e.product === null);
	}

	function getItemErrors(itemIndex: number) {
		return validationErrors.filter((e) => e.product?.index === itemIndex);
	}

	function getChoiceErrors(itemIndex: number, choiceProductId: number) {
		return validationErrors.filter(
			(e) => e.product?.index === itemIndex && e.choiceProduct?.id === choiceProductId
		);
	}

	function getDisplayError(itemIndex: number): string | null {
		const errors = getItemErrors(itemIndex);
		const itemError = errors.find((e) => e.choiceProduct === null);

		if (itemError) {
			return errorMessages[itemError.type];
		}

		const hasChoiceErrors = errors.some((e) => {
			return e.choiceProduct !== null;
		});

		if (hasChoiceErrors) {
			return 'Choices unavailable';
		}

		return null;
	}

	function hasItemError(itemIndex: number) {
		return getDisplayError(itemIndex) !== null;
	}

	function isProductUnavailable(itemIndex: number) {
		return getItemErrors(itemIndex).some(
			(e) => e.choiceProduct === null && e.type === 'ProductInactiveOrDisabled'
		);
	}

	function buildOrderPayload() {
		return {
			items: basket.items.map((item) => {
				let formattedChoices = duplicateGroupedIds(item.choices);
				return {
					productId: item.productId,
					quantity: item.quantity,
					choices: formattedChoices
				};
			}),
			comment: orderComment,
			pickupTime: scheduledTime ? Math.floor(scheduledTime.getTime() / 1000) : null,
			tableNumber: tableNumber ?? null
		};
	}

	async function validate(): Promise<ValidationError[]> {
		validating = true;

		try {
			const res = await fetch(`${BASE_URL}/order/validate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(buildOrderPayload())
			});

			const data: ValidationError[] = await res.json();

			validationErrors = data;

			return data;
		} catch {
			validationErrors = [];
			return [];
		} finally {
			validating = false;
		}
	}

	// ─── Revalidation ────────────────────────────────────────────────────────────
	let revalidateTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		const itemCount = basket.items.length;

		clearTimeout(revalidateTimer);

		if (!basket.loading) {
			if (itemCount === 0) {
				validationErrors = [];
			} else {
				revalidateTimer = setTimeout(validate, 400);
			}
		}

		return () => clearTimeout(revalidateTimer);
	});

	// ─── Table / time state ─────────────────────────────────────────────────────
	let tableNumber = $state<number | null>(tableNumberStore.value);

	$effect(() => {
		// Keep local state synced when store changes externally
		tableNumber = tableNumberStore.value;
	});

	$effect(() => {
		console.log('Saving');
		basket.saveComment(orderComment);
	});

	$effect(() => {
		// Persist user changes
		tableNumberStore.set(tableNumber);
	});

	let scheduledTime = $state<Date | null>(null);

	// ─── Order placement ─────────────────────────────────────────────────────────
	let placing = $state(false);
	let placeError = $state<string | null>(null);

	async function placeOrder() {
		placeError = null;

		const errors = await validate();

		if (errors.length > 0) {
			return;
		}

		placing = true;

		try {
			const res = await fetch(`${BASE_URL}/order`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(buildOrderPayload())
			});

			const data = await res.json();

			if (data.validationErrors?.length > 0) {
				validationErrors = data.validationErrors;
				return;
			}

			if (data.orderId) {
				pendingOrderStore.add(data.orderId);
				basket.clear();
				tableNumberStore.set(null);
				window.location.href = `/orders/${data.orderId}`;
			} else {
				placeError = 'Something went wrong placing your order. Please try again.';
			}
		} catch {
			placeError = 'Network error. Please check your connection and try again.';
		} finally {
			placing = false;
		}
	}

	let canPlace = $derived(
		basket.items.length > 0 &&
			!basket.loading &&
			!validating &&
			!placing &&
			validationErrors.length === 0
	);
</script>

<section class="mx-auto max-w-2xl px-1 py-2">
	<!-- Time picker header -->
	<div class="mb-4 flex flex-row items-center justify-center gap-2">
		<h2 class="text-main text-lg font-semibold">Time:</h2>
		<TimePicker bind:scheduledTime />
	</div>

	<div class="overflow-hidden rounded-3xl border border-200 bg-100 shadow-sm">
		{#if basket.loading}
			<div class="flex flex-col items-center gap-4 py-10 text-center">
				<Spinner size="lg" />
				<p class="text-main/40 text-sm">Loading basket…</p>
			</div>
		{:else if basket.error}
			<p class="text-main/40 py-10 text-center text-lg">Failed to load basket. Please try again.</p>
		{:else if basket.items.length === 0}
			<p class="text-main/40 py-10 text-center text-lg">Your basket is empty.</p>
		{:else}
			<ul class="flex flex-col gap-2 p-3">
				{#each loadedItems as item, i (item.product.id + JSON.stringify(item.choices.map((c) => c.product.id)))}
					{@const displayError = getDisplayError(i)}
					{@const hasError = hasItemError(i)}

					<li
						class="flex items-center gap-3 rounded-2xl border bg-200 p-2 shadow-xs transition-all"
						class:border-300={!hasError}
						class:border-red-400={hasError}
					>
						<img
							src={item.product.imgURL}
							alt={item.product.title[currentLanguage]}
							class="h-12 w-12 shrink-0 rounded-xl object-cover"
						/>

						<div class="min-w-0 flex-1">
							<p
								class="text-main truncate font-medium"
								class:line-through={isProductUnavailable(i)}
							>
								{item.product.title[currentLanguage]}
							</p>

							<div class="mt-0.5 flex items-center gap-2">
								{#if displayError}
									<span
										class="rounded-full bg-red-400/10 px-2 py-0.5 text-xs font-medium text-nowrap text-red-500 dark:bg-red-500/80 dark:text-light"
									>
										{displayError}
									</span>
								{/if}
							</div>

							{#if item.choices.length > 0}
								<p class="text-main/40 text-xs">
									{#each item.choices as choice, choiceIndex}
										{@const choiceErrors = getChoiceErrors(i, choice.product.id)}
										<span
											class:line-through={choiceErrors.length > 0}
											class:text-red-400={choiceErrors.length > 0}
										>
											{choice.quantity > 1
												? `${choice.quantity}x ${choice.product.title[currentLanguage]}`
												: choice.product.title[currentLanguage]}
										</span>
										{#if choiceIndex < item.choices.length - 1}<span class="-ml-0.5">,&nbsp;</span
											>{/if}
									{/each}
								</p>
							{/if}

							<span class="text-main/60 text-sm">€{getItemTotal(item).toFixed(2)}</span>
						</div>

						<AmountController
							id={i}
							{decrease}
							{increase}
							{remove}
							max={50}
							currentAmount={item.quantity}
							disableIncrease={hasError &&
								!getItemErrors(i).some((e) => e.type === 'QuantityRange')}
						/>
					</li>
				{/each}
			</ul>

			<!-- Divider -->

						<OrderCommentField bind:value={orderComment} />

						<div class="mx-4 h-px bg-300"></div>

			<!-- Order-level errors -->
			{#if getOrderErrors().length > 0 || placeError}
				<div class="space-y-1 px-4 pt-3">
					{#each getOrderErrors() as error}
						<p class="text-center text-sm text-red-400">
							{errorMessages[error.type] ?? error.type}
						</p>
					{/each}
					{#if placeError}
						<p class="text-center text-sm text-red-400">{placeError}</p>
					{/if}
				</div>
			{/if}

			<!-- Total row -->
			<div class="flex items-center justify-between px-5 py-4">
				<span class="text-main/40 font-semibold">Total</span>
				<span class="text-main text-xl font-semibold">€{basketTotal(loadedItems).toFixed(2)}</span>
			</div>
		{/if}
	</div>

	<!-- Actions -->
	<div class="mt-4 flex w-full items-stretch gap-1.5">
		<Button class="flex-1" variant="ghost" size="sm" onclick={() => (window.location.href = '/')}>
			Continue shopping
		</Button>
		<Button class="flex-1" size="sm" variant="primary" disabled={!canPlace} onclick={placeOrder}>
			{#if placing}
				Placing order…
			{:else if validating}
				Checking…
			{:else}
				Place order
			{/if}
		</Button>
	</div>
</section>
