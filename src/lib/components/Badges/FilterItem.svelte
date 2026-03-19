<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';
	export let value: string = '';
	export let group: string;
	export let label: string = '';
	export let size: Size = 'sm';
	export let checked: boolean = false;
	let className: string = '';
	export { className as class };
	const sizeStyle: Record<Size, string> = {
		sm: 'text-xs rounded-xl px-2.5 py-0.5',
		md: 'text-sm rounded-xl px-3 py-0.5',
		lg: 'text-base rounded-2xl px-3.5 py-1'
	};
	$: baseStyles = `border-2 mx-1 inline-flex items-center cursor-pointer select-none transition-all active:scale-95 shadow-sm border-300 bg-100 ${sizeStyle[size]} ${className}`;
</script>

<label class="inline-flex" on:change {...$$restProps}>
	<input type="checkbox" name={group} {value} bind:checked class="peer hidden" />
	<span class={baseStyles}>
		<slot>{label}</slot>
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
