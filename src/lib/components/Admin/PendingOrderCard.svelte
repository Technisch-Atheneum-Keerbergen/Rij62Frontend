<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { Order } from '$lib/api/types/order';
	import type { UrgencyLevel } from '$lib/api/types/dish';

	let {
		order,
		onAccept,
		now = Date.now(),
		class: className = ''
	}: {
		order: Order;
		onAccept: () => void;
		now?: number;
		class?: string;
	} = $props();

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	function formatTime(unix: number) {
		return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function urgencyFor(pickupUnix: number, nowMs: number): UrgencyLevel {
		const diffMin = (pickupUnix * 1000 - nowMs) / 60_000;
		if (diffMin <= 30) return 'red';
		if (diffMin <= 90) return 'yellow';
		return 'green';
	}

	function formatCountdown(unix: number, nowMs: number): string {
		const diffMs = unix * 1000 - nowMs;
		if (diffMs <= 0) return 'NOW';
		const totalMin = Math.floor(diffMs / 60_000);
		if (totalMin < 60) return `${totalMin}m`;
		const h = Math.floor(totalMin / 60);
		const m = totalMin % 60;
		return m === 0 ? `${h}h` : `${h}h ${m}m`;
	}

	const urgencyRing: Record<UrgencyLevel, string> = {
		red: 'ring-2 ring-red-400/60',
		yellow: 'ring-2 ring-yellow-400/60',
		green: 'ring-2 ring-amber-400/40'
	};

	const urgencyDot: Record<UrgencyLevel, string> = {
		red: 'bg-red-500',
		yellow: 'bg-yellow-400',
		green: 'bg-green-500'
	};

	const urgencyLabel: Record<UrgencyLevel, string> = {
		red: 'text-red-500',
		yellow: 'text-yellow-500',
		green: 'text-green-500'
	};

	const totalItems = $derived(order.items.reduce((sum, item) => sum + item.quantity, 0));
	const pickupUnix = $derived(order.pickupTime ?? order.createdTime);
	const urgency = $derived(urgencyFor(pickupUnix, now));
	const countdown = $derived(order.pickupTime ? formatCountdown(pickupUnix, now) : null);
</script>

<div
	transition:slide={{ axis: 'x', duration: 200 }}
	class="flex h-fit w-48 shrink-0 flex-col overflow-hidden rounded-3xl border-300 bg-200 p-1 shadow-sm transition-all {urgencyRing[
		urgency
	]} {className}"
>
	<!-- Header -->
	<div class="m-1 flex flex-col gap-0.5 rounded-2xl border border-400/50 bg-300 px-3 py-2">
		<div class="flex items-center justify-between">
			<span class="text-main/50 text-xs font-semibold">
				{order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
			</span>
			{#if countdown}
				<div class="flex items-center gap-1">
					<span
						class="h-2 w-2 shrink-0 rounded-full {urgencyDot[urgency]} {urgency === 'red'
							? 'animate-pulse'
							: ''}"
					></span>
					<span class="text-xs font-semibold tabular-nums {urgencyLabel[urgency]}">
						{countdown}
					</span>
				</div>
			{:else}
				<span class="h-2 w-2 animate-pulse rounded-full bg-amber-400"></span>
			{/if}
		</div>
		<div class="flex items-center justify-between gap-2">
			<span class="text-main text-sm font-bold">
				{totalItems} item{totalItems !== 1 ? 's' : ''}
			</span>
			{#if order.pickupTime}
				<span class="text-main/60 text-xs font-semibold tabular-nums">
					{formatTime(order.pickupTime)}
				</span>
			{/if}
		</div>
		<span class="text-main/40 text-[10px] tabular-nums">
			Ordered {formatTime(order.createdTime)}
		</span>
	</div>

	<!-- Item list (read-only) -->
	<div class="mx-1 mt-0.5 flex flex-col gap-1">
		{#each order.items as item (item.id)}
			<div
				class="flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-3 py-1.5"
			>
				<span class="text-main/50 shrink-0 text-xs font-bold tabular-nums">{item.quantity}</span>
				<div class="min-w-0 flex-1">
					<p class="text-main truncate text-xs font-semibold">
						{item.product.title[currentLanguage]}
					</p>
					{#if item.choices && item.choices.length > 0}
						<p class="text-main/40 truncate text-[10px]">
							{item.choices.map((c) => c.product.title[currentLanguage]).join(', ')}
						</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Accept button -->
	<div class="m-1">
		<button
			onclick={onAccept}
			class="w-full rounded-2xl bg-amber-400/15 px-3 py-2 text-sm font-semibold text-amber-500
				transition-all active:scale-[0.97] active:bg-amber-400/25 dark:bg-amber-500/20 dark:text-amber-300"
		>
			Accept
		</button>
	</div>
</div>
