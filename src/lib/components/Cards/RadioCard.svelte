<script lang="ts">
	import Card from './Card.svelte';

	export let value: boolean = false;
	export let group: string;

	export let title: string = '';
	export let description: string = '';
	export let price: string | null = null;
	export let imageSrc: string = '';
	export let alt: string = 'Card image';
</script>

<label class="flex">
	<input type="radio" name={group} {value} class="peer hidden" />
	<Card {title} {description} {price} {imageSrc} {alt} />
</label>

<style>
	input:checked + :global(div) {
		border-color: var(--color-primary-300);
		background-color: var(--color-300);
	}
</style>
