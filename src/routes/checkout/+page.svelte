<script lang="ts">
	import { apiFetch } from '$lib/api/client';
	import type { CreateOrder, CreateOrderItem } from '$lib/api/types/order';
	import Button from '$lib/components/Button.svelte';
	import FireWork from '$lib/components/Misc/FireWork.svelte';
	import TimeInput from '$lib/components/Misc/TimeInput.svelte';
	import { basket } from '$lib/stores/basket.svelte';
	import { pendingOrderStore } from '$lib/stores/pendingOrders';
	import { onMount } from 'svelte';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	let pickupTime = $state<Date | null>(null);
	let success = $state(false);

	onMount(() => {
		pickupTime = new Date();
	});

	async function bypassPayment() {
		const items: CreateOrderItem[] = basket.items.map((item) => ({
			productId: item.productId,
			choices: item.choices.flatMap((c) => Array(c.quantity).fill(c.id)),
			quantity: item.quantity
		}));

		const body: CreateOrder = {
			pickupTime: Math.round((pickupTime ?? new Date()).getTime() / 1000),
			tableNumber: null,
			items
		};

		let orderId = null;
		try {
			orderId = await apiFetch('/order', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
		} catch (e) {
			alert('Something went wrong\n' + e);
			return;
		}

		basket.clear();

		if (orderId == null) {
			success = false;
			return;
		}

		pendingOrderStore.add(orderId);
		success = true;
		setTimeout(() => {
			location.href = '/orders';
		}, 1000);
	}
</script>

{#if success}
	<FireWork message="Success" />
{/if}

<label for="pickupTime">Choose a time for your order to be delivered</label>
<TimeInput bind:value={pickupTime} id="pickupTime" />

<Button class="w-full flex-1 py-1.5" size="sm" variant="primary" onclick={bypassPayment}>
	bypass payment
</Button>
