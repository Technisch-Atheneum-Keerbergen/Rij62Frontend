<script lang="ts">
	let {
		title = '',
		price = null,
		imageSrc = '',
		alt = 'Card image',
		class: className = '',
		onselect,
		...restProps
	}: {
		title?: string;
		price?: string | null;
		imageSrc?: string;
		alt?: string;
		class?: string;
		onselect?: () => void;
	} = $props();
</script>

<div
	{...restProps}
	onclick={() => onselect?.()}
	class="flex max-w-40 min-w-40 cursor-pointer flex-col overflow-hidden rounded-3xl border-2 border-300 bg-200 p-1 shadow-sm transition-all hover:shadow-md active:scale-95 {className}"
>
	{#if imageSrc}
		<img src={imageSrc} {alt} class="h-25 min-h-25 w-full rounded-2xl object-cover" />
	{/if}

	<div class="flex h-full flex-col justify-between p-1.5 text-left">
		<h3 class="text-center text-xs font-semibold">{title}</h3>

		{#if price}
			<p class="text-muted w-full text-center text-sm">€{price}</p>
		{/if}
	</div>
</div>
