<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { apiCall, apiFetch, apiFetchJson } from '$lib/api/client';
	import type { Order, OrderId } from '$lib/api/types/order';
	import SvgCheckMark from '$lib/components/SVG/SvgCheckMark.svelte';
	import SvgCard from '$lib/components/SVG/SvgCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import SvgXmark from '$lib/components/SVG/SvgXmark.svelte';

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
			const result = await apiFetchJson(`/payment/pay/${orderId}?bypassPayment=true`, {
				method: 'POST',
				body: JSON.stringify({ redirectUrl })
			});
			if (result && (result as any).redirectUrl) {
				window.location.href = (result as any).redirectUrl;
			} else {
				console.log(result);
				errorMessage = 'Could not initiate payment. Please try again.';
			}
		} catch (e: any) {
			console.log(e);
			errorMessage = e;
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
				<Spinner size="lg" />
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
		{:else if state == 'NotPaid'}
			<div class="flex flex-col items-center gap-3 text-center">
				<h1 class="text-xl font-bold">Continue to payment</h1>
				<p class="text-sm opacity-80">
					Your order has not been paid yet. <br /> Proceed to pay via Bancontact.
				</p>
				<div class="bg-surface-200 flex h-16 items-center justify-center gap-1">
					<span
						class="rounded-full bg-primary-500 stroke-primary-500 p-2 px-4 text-xl font-bold text-light dark:bg-primary-500/50"
					>
						€{order?.totalPrice.toFixed(2)}
					</span>
					<span class="rounded-full bg-300 stroke-primary-500 p-2 px-4 text-xl font-semibold">
						{order?.items.length} item{order?.items.length == 1 ? '' : 's'}
					</span>
				</div>
				<p class=""></p>

				{#if errorMessage}
					<p class="text-error-500 text-sm">{errorMessage}</p>
				{/if}

				<Button onclick={initiatePayment} disabled={payLoading} size="md" class="w-full">
					{#if payLoading}
						<span class="inline-flex items-center gap-2">
							<Spinner size="sm" />
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
					class="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 stroke-red-500 p-2"
				>
					<SvgXmark />
				</div>
				<h1 class="text-xl font-bold">Payment failed</h1>
				<p class="text-surface-500 text-sm">Something went wrong during payment.</p>
				{#if errorMessage}
					<p class="text-error-500 text-sm">{errorMessage}</p>
				{/if}
				<Button onclick={initiatePayment} disabled={payLoading} size="md" class="w-full">
					{#if payLoading}
						<span class="inline-flex items-center gap-2">
							<Spinner size="sm" />
							Processing…
						</span>
					{:else}
						Try again
					{/if}
				</Button>
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
					Your order has been paid. <br /> Track its progress on the orders page.
				</p>

				<Button variant="primary" class="w-full" onclick={() => (window.location.href = `/orders`)}
					>View orders</Button
				>
			</div>
		{/if}
	</div>
</div>
