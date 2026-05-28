<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { apiFetch } from '$lib/api/client';
	import type { Order, OrderId } from '$lib/api/types/order';
	import SvgCheckMark from '$lib/components/SVG/SvgCheckMark.svelte';
	import SvgCard from '$lib/components/SVG/SvgCard.svelte';
	import Button from '$lib/components/Button.svelte';

	const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL as string;

	const orderId: OrderId = page.params.id as OrderId;

	type PaymentState = 'loading' | 'NotPaid' | 'Success' | 'Failed' | 'error';

	let state: PaymentState = 'loading';
	let order: Order | null = null;
	let payLoading = false;
	let errorMessage = '';

	async function fetchOrder() {
		if (!orderId) {
			state = 'error';
			errorMessage = 'No order ID provided.';
			return;
		}
		const result = await apiFetch(`/order/${orderId}`);
		if (!result) {
			state = 'error';
			errorMessage = 'Could not load order.';
			return;
		}
		order = result as unknown as Order;
		const status = order.paymentStatus;
		if (status === 'NotPaid') state = 'NotPaid';
		else if (status === 'Success') state = 'Success';
		else if (status === 'Failed') state = 'Failed';
		else state = 'NotPaid';
	}

	async function initiatePayment() {
		if (!orderId) return;
		payLoading = true;
		errorMessage = '';
		try {
			const redirectUrl = `${FRONTEND_BASE_URL}/orders?paidOrderId=${orderId}`;
			const result = await apiFetch(`/payment/pay/${orderId}?bypassPayment=true`, {
				method: 'POST',
				body: JSON.stringify({ redirectUrl })
			});
			if (result && (result as any).redirectUrl) {
				window.location.href = (result as any).redirectUrl;
			} else {
				errorMessage = 'Could not initiate payment. Please try again.';
			}
		} catch {
			errorMessage = 'Something went wrong. Please try again.';
		} finally {
			payLoading = false;
		}
	}

	onMount(fetchOrder);
</script>

<div class="flex items-center justify-center p-6">
	<div class="w-full max-w-sm rounded-2xl bg-100 p-8 shadow-sm">
		{#if state === 'loading'}
			<div class="flex flex-col items-center gap-4 text-center">
				<div
					class="border-surface-300 h-10 w-10 animate-spin rounded-full border-4 border-t-primary-500"
				></div>
				<p class="text-surface-500 text-sm">Loading payment status…</p>
			</div>
		{:else if state === 'error'}
			<div class="flex flex-col items-center gap-3 text-center">
				<div class="bg-surface-200 flex h-16 w-16 items-center justify-center rounded-full">
					<svg
						class="text-surface-500 h-8 w-8"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
				</div>
				<h1 class="text-xl font-bold">Something went wrong</h1>
				<p class="text-surface-500 text-sm">{errorMessage}</p>
				<a
					href="/orders"
					class="bg-surface-200 mt-2 w-full rounded-xl py-2.5 text-center text-sm font-semibold"
				>
					Go to orders
				</a>
			</div>
		{:else if state === 'NotPaid'}
			<div class="flex flex-col items-center gap-3 text-center">
				<div
					class="bg-surface-200 stroke-main stroke-main flex h-16 w-16 items-center justify-center rounded-full"
				>
					<SvgCard />
				</div>

				{order?.totalPrice}
				<h1 class="text-xl font-bold">Continue to payment</h1>
				<p class="text-surface-500 text-sm">
					Your order has not been paid yet. Proceed to pay via Bancontact.
				</p>
				{#if errorMessage}
					<p class="text-error-500 text-sm">{errorMessage}</p>
				{/if}

				<Button onclick={initiatePayment} disabled={payLoading} size="md" class="w-full">
					{#if payLoading}
						<span class="inline-flex items-center gap-2">
							<span
								class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
							></span>
							Processing…
						</span>
					{:else}
						Pay now
					{/if}
				</Button>
			</div>
		{:else if state === 'Failed'}
			<div class="flex flex-col items-center gap-3 text-center">
				<div
					class="bg-error-50 ring-error-200 flex h-16 w-16 items-center justify-center rounded-full ring-2"
				>
					<svg
						class="text-error-500 h-8 w-8"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="15" y1="9" x2="9" y2="15" />
						<line x1="9" y1="9" x2="15" y2="15" />
					</svg>
				</div>
				<h1 class="text-xl font-bold">Payment failed</h1>
				<p class="text-surface-500 text-sm">
					Something went wrong during payment. You can try again below.
				</p>
				{#if errorMessage}
					<p class="text-error-500 text-sm">{errorMessage}</p>
				{/if}
				<button
					class="bg-error-500 text-main mt-2 w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
					on:click={initiatePayment}
					disabled={payLoading}
				>
					{#if payLoading}
						<span class="inline-flex items-center gap-2">
							<span class="h-4 w-4 animate-spin rounded-full border-2"></span>
							Processing…
						</span>
					{:else}
						Try again
					{/if}
				</button>
			</div>
		{:else if state === 'Success'}
			<div class="flex flex-col items-center gap-3 text-center">
				<div
					class="bg-success-50 ring-success-200 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 stroke-green-500 p-2"
				>
					<SvgCheckMark />
				</div>
				<h1 class="text-xl font-bold">Payment successful</h1>
				<p class="text-surface-500 text-sm">
					Your order has been paid. Track its progress on the orders page.
				</p>

				<Button variant="primary" class="w-full" onclick={() => (window.location.href = `/orders`)}
					>View orders</Button
				>
			</div>
		{/if}
	</div>
</div>
