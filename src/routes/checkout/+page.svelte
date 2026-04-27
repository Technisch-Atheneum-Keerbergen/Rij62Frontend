<script lang="ts">
	import { apiFetch } from '$lib/api/client';
	import type { CreateOrder, CreateOrderItem } from '$lib/api/types/order';
	import Button from '$lib/components/Button.svelte';
	import FireWork from '$lib/components/Misc/FireWork.svelte';
	import TimeInput from '$lib/components/Misc/TimeInput.svelte';
	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';
	import { basket } from '$lib/stores/basket';
	import { pendingOrderStore } from '$lib/stores/pendingOrders';
	import { onMount } from 'svelte';

	let pickupTime = $state<Date | null>(null);
	let success = $state(false);

	async function bypassPayment() {
		const items: CreateOrderItem[] = $basket.map((item) => ({
			productId: item.product.id,
			choices: item.choices.flatMap((c) => Array(c.amount).fill(c.id))
		}));

		const body: CreateOrder = {
			pickupTime: Math.round((pickupTime ? pickupTime : new Date()).getTime() * 0.001),
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
		}

		basket.clear();
		if (orderId == null) {
			success = false;
			return;
		}
		pendingOrderStore.add(orderId);
		success = true;
		setTimeout(() => {
			return;
			location.href = '/basket';
		}, 1000);
	}

	onMount(() => {
		pickupTime = new Date();
	});
</script>

{#if success}
	<FireWork message="Success"></FireWork>
{/if}

<label for="pickupTime">Choose a time for your order to be delivered</label>
<TimeInput bind:value={pickupTime} id="pickupTime"></TimeInput>

<Button class="w-full flex-1 py-1.5" size="sm" variant="primary" onclick={bypassPayment}>
	bypass payment
</Button>
