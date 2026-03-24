<script lang="ts">
	type Variant = 'primary' | 'secondary' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	let {
		variant = 'ghost',
		size = 'sm',
		class: className = '',
		children,
		...restProps
	}: {
		variant?: Variant;
		size?: Size;
		class?: string;
		children?: () => any;
	} = $props();

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

	const styles = $derived(`${baseStyle} ${variantStyle[variant]} ${sizeStyle[size]} ${className}`);
</script>

<span class={styles} {...restProps}>
	{@render children?.()}
</span>
