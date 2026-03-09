<script lang="ts">
	type Variant = 'primary' | 'secondary' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';
	type ButtonType = 'button' | 'submit' | 'reset';

	export let variant: Variant = 'primary';
	export let size: Size = 'md';
	export let disabled: boolean = false;
	export let type: ButtonType = 'button';

	const baseStyle = ``;

	const variantStyle: Record<Variant, string> = {
		primary: '',
		secondary: '',
		ghost: ''
	};

	const sizeStyle: Record<Size, string> = {
		sm: '',
		md: '',
		lg: ''
	};

	$: styles = `${baseStyle} ${variantStyle[variant]} ${sizeStyle[size]}`;
</script>

<button class={styles} {type} {disabled} {...$$restProps}>
	<slot />
</button>
