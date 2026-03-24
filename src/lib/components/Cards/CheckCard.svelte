<script lang="ts">
	import Card from './Card.svelte';

	let {
		value = false,
		group,
		title = '',
		price = null,
		imageSrc = '',
		alt = 'Card image'
	}: {
		value?: boolean;
		group: string;
		title?: string;
		description?: string;
		price?: string | null;
		imageSrc?: string;
		alt?: string;
	} = $props();
</script>

<label class="flex">
	<input type="checkbox" name={group} {value} class="peer hidden" />
	<Card {title} {price} {imageSrc} {alt} />
</label>

<style>
	input:checked + :global(div) {
		border-color: var(--color-primary-300);
		background-color: var(--color-300);
	}
</style>
