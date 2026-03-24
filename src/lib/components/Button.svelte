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

	const baseStyle =
		'border-2 inline cursor-pointer px-2 py-0.5 transition-all active:scale-95 shadow-sm';

	const variantStyle: Record<Variant, string> = {
		primary: 'border-primary-600 bg-primary-500 active:bg-primary-600 text-light',
		secondary: 'border-secondary-600 bg-secondary-500 active:bg-secondary-600 text-dark',
		ghost: 'border-500 bg-300 active:bg-200'
	};

	const sizeStyle: Record<Size, string> = {
		sm: 'rounded-xl',
		md: 'text-lg rounded-xl px-2.5',
		lg: 'text-xl rounded-2xl px-3 py-1'
	};

	const styles = $derived(
		`${baseStyle} ${variantStyle[variant]} ${sizeStyle[size]} ${className} ${
			disabled ? 'text-muted pointer-events-none' : ''
		}`
	);
</script>

<button class={styles} {disabled} {...restProps}>
	{@render children?.()}
</button>
