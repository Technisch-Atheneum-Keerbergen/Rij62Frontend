<script lang="ts">
	type Variant = 'primary' | 'secondary' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';
	type ButtonType = 'button' | 'submit' | 'reset';

	export let variant: Variant = 'primary';
	export let size: Size = 'sm';
	export let disabled: boolean = false;
	export let type: ButtonType = 'button';

	let className: string = '';
	export { className as class };

	const baseStyle =
		`border-2 mx-1.5 inline cursor-pointer px-2 py-0.5 transition-all active:scale-95 shadow-sm ` +
		className;

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

	$: styles = `${baseStyle} ${variantStyle[variant]} ${sizeStyle[size]}`;
</script>

<button class={styles} {type} {disabled} {...$$restProps}>
	<slot />
</button>
