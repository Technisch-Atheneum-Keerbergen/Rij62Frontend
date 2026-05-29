<!-- TimePicker.svelte -->
<script lang="ts">
	import { slide } from 'svelte/transition';
	import Button from '../Button.svelte';

	let { scheduledTime = $bindable<Date | null>(null) } = $props();

	let open = $state(false);
	let showCustom = $state(false);
	let customInput = $state('');

	let wrapper: HTMLDivElement | undefined;

	function getNextSlots(count: number): Date[] {
		const now = new Date();
		const slotMs = 15 * 60 * 1000;

		const nextSlot = new Date(Math.ceil(now.getTime() / slotMs) * slotMs);

		const minGap = 7 * 60 * 1000;

		const start =
			nextSlot.getTime() - now.getTime() < minGap
				? new Date(nextSlot.getTime() + slotMs)
				: nextSlot;

		return Array.from({ length: count }, (_, i) => {
			return new Date(start.getTime() + i * slotMs);
		});
	}

	function formatSlot(date: Date): string {
		return date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatScheduled(date: Date): string {
		const now = new Date();

		if (date.toDateString() === now.toDateString()) {
			return `Today at ${formatSlot(date)}`;
		}

		return (
			date.toLocaleDateString([], {
				weekday: 'short',
				month: 'short',
				day: 'numeric'
			}) +
			' at ' +
			formatSlot(date)
		);
	}

	let slots = $derived(getNextSlots(8));

	function select(date: Date | null) {
		scheduledTime = date;
		open = false;
		showCustom = false;
	}

	function applyCustom() {
		if (!customInput) return;

		const [h, m] = customInput.split(':').map(Number);

		const d = new Date();

		d.setHours(h, m, 0, 0);

		if (d < new Date()) {
			d.setDate(d.getDate() + 1);
		}

		select(d);
	}

	function handleClickOutside(event: MouseEvent) {
		if (!open || !wrapper) return;

		if (!wrapper.contains(event.target as Node)) {
			open = false;
			showCustom = false;
		}
	}

	$effect(() => {
		if (!open) return;

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div bind:this={wrapper} class="relative flex flex-col items-center">
	<button
		class="flex items-center gap-1 rounded-full border-2 border-300 bg-200 px-4 py-1.5 text-sm font-medium shadow-sm transition-all hover:border-primary-400 active:scale-95"
		onclick={(e) => {
			e.stopPropagation();

			open = !open;
			showCustom = false;
		}}
	>
		<span class="text-base">🕐</span>

		{#if scheduledTime}
			<span>{formatScheduled(scheduledTime)}</span>
		{:else}
			<span>Now</span>
		{/if}
	</button>

	{#if open}
		<div
			class="absolute top-full left-1/2 z-50 mt-3 w-[320px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border-2 border-300 bg-200 p-4 shadow-xl"
			transition:slide={{ duration: 180 }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.key === 'Escape'}
			role="button"
			tabindex="0"
		>
			{#if !showCustom}
				<p class="mb-3 text-center text-sm font-medium opacity-70">When do you want your order?</p>

				<div class="flex flex-wrap justify-center gap-2">
					<button
						class="rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all active:scale-95"
						class:border-primary-400={scheduledTime === null}
						class:bg-300={scheduledTime === null}
						class:border-300={scheduledTime !== null}
						onclick={() => select(null)}
					>
						Now
					</button>

					{#each slots as slot}
						<button
							class="rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all active:scale-95"
							class:border-primary-400={scheduledTime?.getTime() === slot.getTime()}
							class:bg-300={scheduledTime?.getTime() === slot.getTime()}
							class:border-300={scheduledTime?.getTime() !== slot.getTime()}
							onclick={() => select(slot)}
						>
							{formatSlot(slot)}
						</button>
					{/each}

					<button
						class="rounded-xl border-2 border-300 px-4 py-2 text-sm font-medium opacity-60 transition-all hover:opacity-100 active:scale-95"
						onclick={() => (showCustom = true)}
					>
						More…
					</button>
				</div>
			{:else}
				<p class="mb-3 text-center text-sm font-medium opacity-70">Pick a time</p>

				<div class="flex items-center justify-center gap-3">
					<input
						type="time"
						bind:value={customInput}
						class="rounded-xl border-2 border-300 bg-100 px-3 py-2 text-sm"
					/>

					<Button onclick={applyCustom} size="sm">Set</Button>

					<button class="text-sm opacity-50 hover:opacity-80" onclick={() => (showCustom = false)}>
						Back
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
