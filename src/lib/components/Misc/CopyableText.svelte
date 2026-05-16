<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { CheckOutline, ClipboardCleanSolid } from 'flowbite-svelte-icons';

	type Props = {
		value: string;
	};

	let props: Props = $props();

	let value = $derived(props.value);
	let copied = $state(false);

	function handleCopy() {
		copied = true;
		navigator.clipboard.writeText(value);

		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<div class="relative rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
	<code>{value}</code>
	<Button onclick={handleCopy} class="absolute inset-e-2 top-2 h-8 px-2.5 font-medium focus:ring-0">
		{#if copied}
			<CheckOutline class="h-3 w-3" /> Copied
		{:else}
			<ClipboardCleanSolid class="h-3 w-3" /> Copy
		{/if}
	</Button>
</div>
