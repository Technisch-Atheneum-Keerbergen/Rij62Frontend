<script lang="ts">
	import { duplicateGroupedIds } from '$lib/api/types/order';
	import TablePicker from '$lib/components/Basket/TablePicker.svelte';
	import TimePicker from '$lib/components/Basket/TimePicker.svelte';
	import Button from '$lib/components/Button.svelte';
	import AmountController from '$lib/components/Misc/AmountController.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { basket, getItemTotal, type LoadedBasketItem } from '$lib/stores/basket.svelte';
	import { pendingOrderStore } from '$lib/stores/pendingOrders';
	import { tableNumberStore } from '$lib/stores/tableNumber.svelte';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';
	const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

	// ─── Basket state ────────────────────────────────────────────────────────────
	let loadedItems = $derived(basket.loadedItems);

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
		ProductInactiveOrDisabled: 'This item is unavailable.',
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
				// basket.clear()
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

	// ─── Can place ──────────────────────────────────────────────────────────────
	let canPlace = $derived(
		basket.items.length > 0 &&
			!basket.loading &&
			!validating &&
			!placing &&
			validationErrors.length === 0
	);
</script>

<section class="mx-auto max-w-2xl">
	<div class="flex flex-row items-center justify-center gap-2">
		<!--
		<TablePicker bind:tableNumber />
		-->
		<h2 class="mb-4 text-center text-lg font-semibold">Time:</h2>
		<TimePicker bind:scheduledTime />
	</div>

	<div class="rounded-3xl bg-100 p-2 shadow-md">
		{#if basket.loading}
			<div class="flex flex-col items-center gap-4 py-8 text-center">
				<Spinner size="lg" />
			</div>
		{:else if basket.error}
			<p class="py-5 text-center text-lg opacity-60">Failed to load basket. Please try again.</p>
		{:else if basket.items.length === 0}
			<p class="py-5 text-center text-lg opacity-60">Your basket is empty.</p>
		{:else}
			<ul class="space-y-3">
				{#each loadedItems as item, i (item.product.id + JSON.stringify(item.choices.map((c) => c.product.id)))}
					{@const displayError = getDisplayError(i)}
					{@const hasError = hasItemError(i)}

					<li
						class="flex items-center justify-between rounded-2xl border-2 bg-200 p-2 shadow-sm transition-all"
						class:border-300={!hasError}
						class:border-red-300={hasError}
					>
						<div class="flex items-center gap-3">
							<img
								src={item.product.imgURL}
								alt={item.product.title[currentLanguage]}
								class="h-12 w-12 rounded-lg object-cover"
							/>

							<div>
								<div class="flex flex-col items-start">
									<p class="font-medium" class:line-through={isProductUnavailable(i)}>
										{item.product.title[currentLanguage]}
									</p>

									{#if displayError}
										<span
											class="rounded-full bg-red-100 px-1 py-0.5 text-xs font-medium text-red-500"
										>
											{displayError}
										</span>
									{/if}
								</div>

								{#if item.choices.length > 0}
									<p class="text-muted text-xs opacity-80">
										{#each item.choices as choice, choiceIndex}
											{@const choiceErrors = getChoiceErrors(i, choice.product.id)}
											<span
												class:line-through={choiceErrors.length > 0}
												class:text-red-400={choiceErrors.length > 0}
											>
												{choice.quantity > 1
													? `${choice.product.title[currentLanguage]} x${choice.quantity}`
													: choice.product.title[currentLanguage]}
											</span>

											{#if choiceIndex < item.choices.length - 1}
												<span class="-ml-0.5">,&nbsp;</span>
											{/if}
										{/each}
									</p>
								{/if}

								<p class="text-muted text-sm">
									€{getItemTotal(item).toFixed(2)}
								</p>
							</div>
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

			<hr class="mt-6 mb-3 border-300" />

			{#if getOrderErrors().length > 0}
				<div class="mb-2 space-y-1">
					{#each getOrderErrors() as error}
						<p class="text-center text-sm text-red-400">
							{errorMessages[error.type] ?? error.type}
						</p>
					{/each}
				</div>
			{/if}

			{#if placeError}
				<p class="mb-2 text-center text-sm text-red-400">
					{placeError}
				</p>
			{/if}

			<div class="flex items-center justify-between p-2 font-semibold">
				<span class="text-muted">Total:</span>

				<span class="text-xl">
					€{basketTotal(loadedItems).toFixed(2)}
				</span>
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
			disabled={!canPlace}
			onclick={placeOrder}
		>
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
