<script lang="ts">
	let {
		value = $bindable(),
		maxChars = 300
	}: {
		value: string;
		maxChars?: number;
	} = $props();

	const remaining = $derived(maxChars - (value?.length ?? 0));
</script>

<div class="relative h-fit p-2">
	<textarea
		bind:value
		maxlength={maxChars}
		placeholder="Anything we should know?"
		class="h-fit max-h-36 min-h-11 w-full rounded-2xl border border-300 bg-50 placeholder:font-light placeholder:text-black/50 focus:inset-shadow-sm dark:placeholder:text-white/50"
	></textarea>
	<span
		class="absolute right-4 bottom-4 text-xs tabular-nums
        {remaining <= 0 ? 'text-red-500' : remaining <= 20 ? 'text-amber-500' : 'text-muted'}"
	>
		{maxChars - remaining}/{maxChars}
	</span>
</div>
