<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	type Variant = 'primary' | 'secondary' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';
	let {
		variant = 'primary',
		size = 'sm',
		disabled = false,
		class: className = '',
		children,
		...restProps
	}: HTMLButtonAttributes & {
		variant?: Variant;
		size?: Size;
	} = $props();
	const baseStyle = 'border-2 inline px-2 py-0.5 transition-all shadow-sm';
	const variantStyle: Record<Variant, string> = {
		primary: 'border-primary-600 bg-primary-500 text-light',
		secondary: 'border-secondary-500 bg-secondary-400 text-dark',
		ghost: 'border-500 bg-300'
	};
	const sizeStyle: Record<Size, string> = {
		sm: 'rounded-xl',
		md: 'text-lg rounded-xl px-2.5',
		lg: 'text-xl rounded-2xl px-3 py-1'
	};
	const styles = $derived(
		`${baseStyle} ${variantStyle[variant]} ${sizeStyle[size]} ${className} ${
			disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
		}`
	);
</script>

<button class={styles} {disabled} data-disabled={disabled || undefined} {...restProps}>
	{@render children?.()}
</button>

<style>
	button:not([data-disabled]):active {
		transform: scale(0.95);
	}
	button:not([data-disabled]).border-primary-600:active {
		background-color: var(--color-primary-600);
	}
	button:not([data-disabled]).border-secondary-500:active {
		background-color: var(--color-secondary-500);
	}
	button:not([data-disabled]).border-500:active {
		background-color: var(--color-200);
	}
</style>
