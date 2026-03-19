<script lang="ts">
	type Variant = 'primary' | 'secondary' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	export let variant: Variant = 'ghost';
	export let size: Size = 'sm';

	let className: string = '';
	export { className as class };

	const baseStyle =
		'border-2 mx-1 inline-flex items-center select-none px-2.5 py-0.5 transition-all shadow-sm';

	const variantStyle: Record<Variant, string> = {
		primary: 'border-primary-600 bg-primary-500 text-light',
		secondary: 'border-secondary-600 bg-secondary-500 text-dark',
		ghost: 'border-300 bg-200 text-dark'
	};

	const sizeStyle: Record<Size, string> = {
		sm: 'text-xs rounded-xl',
		md: 'text-sm rounded-xl px-3',
		lg: 'rounded-2xl px-3.5 py-1'
	};

	$: styles = `${baseStyle} ${variantStyle[variant]} ${sizeStyle[size]} ${className}`;
</script>

<span class={styles} {...$$restProps}>
	<slot />
</span>
