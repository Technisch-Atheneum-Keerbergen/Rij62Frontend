<script lang="ts">
	export let title: string = '';
	export let description: string = '';
	export let price: string | null = null;
	export let imageSrc: string = '';
	export let alt: string = 'Card image';

	let className: string = '';
	export { className as class };
</script>

<div
	{...$$restProps}
	class="flex max-w-40 min-w-40 cursor-pointer flex-col overflow-hidden rounded-3xl border-2 border-300 bg-200 p-1 shadow-sm transition-all hover:shadow-md active:scale-95 {className}"
>
	{#if imageSrc}
		<img src={imageSrc} {alt} class="h-25 min-h-25 w-full rounded-2xl object-cover" />
	{/if}

	<div class="flex h-full flex-col justify-between p-1.5 text-left">
		<div>
			<h3 class="text-xs font-semibold">{title}</h3>

			<p class="text-muted mb-1 text-xs">
				{description}
			</p>
		</div>

		{#if price}
			<p class="text-muted w-full text-center text-sm">€{price}</p>
		{/if}
	</div>
</div>
