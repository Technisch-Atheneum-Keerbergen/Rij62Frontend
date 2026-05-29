<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { apiFetch, apiFetchJson } from '$lib/api/client';
	import type { Order, OrderId } from '$lib/api/types/order';
	import SvgCheckMark from '$lib/components/SVG/SvgCheckMark.svelte';
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
	<div class="w-full max-w-sm overflow-hidden rounded-3xl border border-300 bg-100 shadow-sm">
		{#if state === 'loading'}
			<div class="flex flex-col items-center gap-4 p-8 text-center">
				<Spinner size="lg" />
				<p class="text-main/40 text-sm">Loading payment status…</p>
			</div>
		{:else if state === 'error'}
			<div class="flex flex-col items-center gap-3 p-8 text-center">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 stroke-red-500 p-2"
				>
					<SvgXmark />
				</div>
				<h1 class="text-main text-xl font-semibold">Something went wrong</h1>
				<p class="text-main/40 text-sm">{errorMessage}</p>

				<div class="w-full p-4">
					<Button
						variant="primary"
						class="w-full"
						onclick={() => (window.location.href = `/orders`)}
					>
						View orders
					</Button>
				</div>
			</div>
		{:else if state === 'NotPaid'}
			<div class="flex flex-col gap-0">
				<!-- Header section -->
				<div class="px-6 pt-6 pb-4 text-center">
					<h1 class="text-main text-xl font-semibold">Continue to payment</h1>
					<p class="text-main/40 mt-1 text-sm">
						Your order hasn't been paid yet. Proceed via Bancontact.
					</p>
				</div>

				<!-- Divider -->
				<div class="mx-4 h-px bg-300"></div>

				<!-- Price pill row -->
				<div class="flex items-center justify-center gap-2 px-6 py-4">
					<span
						class="rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xl font-bold text-primary-500 dark:border-primary-500/40 dark:bg-primary-500/30 dark:text-light"
					>
						€{order?.totalPrice.toFixed(2)}
					</span>
					<span
						class="text-main rounded-full border border-300 bg-100 px-4 py-1.5 text-xl font-semibold"
					>
						{order?.items.length} item{order?.items.length === 1 ? '' : 's'}
					</span>
				</div>

				<!-- Divider -->
				<div class="mx-4 h-px bg-300"></div>

				<!-- Action -->
				<div class="p-4">
					{#if errorMessage}
						<p class="mb-3 text-center text-sm text-red-500">{errorMessage}</p>
					{/if}
					<Button onclick={initiatePayment} disabled={payLoading} size="md" class="w-full">
						{#if payLoading}
							<span class="inline-flex items-center gap-2"><Spinner size="sm" />Processing…</span>
						{:else}
							Pay now
						{/if}
					</Button>
				</div>
			</div>
		{:else if state === 'Failed'}
			<div class="flex flex-col gap-0">
				<!-- Header -->
				<div class="flex flex-col items-center gap-3 px-6 pt-6 pb-4 text-center">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 stroke-red-500 p-2"
					>
						<SvgXmark />
					</div>
					<h1 class="text-main text-xl font-semibold">Payment failed</h1>
					<p class="text-main/40 text-sm">
						Something went wrong during payment. <br /> Your order has not been placed yet.
					</p>
				</div>

				<div class="mx-4 h-px bg-300"></div>

				<div class="p-4">
					{#if errorMessage}
						<p class="mb-3 text-center text-sm text-red-500">{errorMessage}</p>
					{/if}
					<Button onclick={initiatePayment} disabled={payLoading} size="md" class="w-full">
						{#if payLoading}
							<span class="inline-flex items-center gap-2"><Spinner size="sm" />Processing…</span>
						{:else}
							Try payment again
						{/if}
					</Button>
				</div>
			</div>
		{:else if state === 'Success'}
			<div class="flex flex-col gap-0">
				<div class="flex flex-col items-center gap-3 px-6 pt-6 pb-4 text-center">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 stroke-green-500 p-2"
					>
						<SvgCheckMark />
					</div>
					<h1 class="text-main text-xl font-semibold">Payment successful</h1>
					<p class="text-main/40 text-sm">
						Your order has been paid. Track its progress on the orders page.
					</p>
				</div>

				<div class="mx-4 h-px bg-300"></div>

				<div class="p-4">
					<Button
						variant="primary"
						class="w-full"
						onclick={() => (window.location.href = `/orders`)}
					>
						View orders
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
