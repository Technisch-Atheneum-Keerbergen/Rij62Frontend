<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';

	type Size = 'sm' | 'md' | 'lg';
	let {
		value = '',
		group,
		label = '',
		size = 'sm',
		checked = $bindable(false),
		class: className = '',
		children,
		...restProps
	}: HTMLLabelAttributes & {
		value?: string;
		group: string;
		label?: string;
		size?: Size;
		checked?: boolean;
	} = $props();

	const sizeStyle: Record<Size, string> = {
		sm: 'text-xs rounded-xl px-2.5 py-0.5',
		md: 'text-sm rounded-xl px-3 py-0.5',
		lg: 'text-base rounded-2xl px-3.5 py-1'
	};

	const baseStyles = $derived(
		`border-2 mx-1 h-fit inline-flex items-center cursor-pointer select-none transition-all active:scale-95 shadow-lg border-300 bg-100 ${sizeStyle[size]} ${className}`
	);
</script>

<label class="inline-flex" {...restProps}>
	<input type="radio" name={group} {value} {checked} class="peer hidden" />

	<span class={baseStyles}>
		{#if children}
			{@render children()}
		{:else}
			{label}
		{/if}
	</span>
</label>

<style>
	input:checked + span {
		border-color: var(--color-primary-300);
		background-color: var(--color-primary-200);
		font-weight: bold;
	}
	:global(.dark) input:checked + span {
		border-color: var(--color-primary-600);
		background-color: var(--color-primary-700);
	}
</style>
