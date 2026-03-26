<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '../Button.svelte';

	let { value = $bindable<Date | null>(null), id } = $props();

	let isInvalid = $state(false);

	function dateToTimeString(date = new Date()): string {
		return date.toTimeString().slice(0, 5);
	}

	function dateFromTimeString(timeString: string): Date {
		return new Date(new Date().toDateString() + ' ' + timeString);
	}

	function addOffset(amount: number) {
		const base = value ? new Date(value) : new Date();
		base.setMinutes(base.getMinutes() + amount);
		value = base;
		validateInput();
	}

	function validateInput() {
		isInvalid = value.getTime() < new Date().getTime();
		console.log(isInvalid);
	}

	let time = {
		get value() {
			if (!value) {
				return dateToTimeString();
			}
			return dateToTimeString(value);
		},
		set value(v: string) {
			if (!v) {
				value = null;
				return;
			}
			value = dateFromTimeString(v);
			validateInput();
		}
	};
</script>

<div class="mb-5 flex w-full max-w-sm flex-col space-y-4">
	<input
		type="time"
		bind:value={time.value}
		{id}
		class="{isInvalid
			? 'border-red-400'
			: ''} m-0 my-1 block w-full rounded-lg border-2 border-primary-200 bg-100 px-3 py-2"
	/>

	<div class="my-0 flex flex-row space-x-2">
		<Button onclick={() => addOffset(5)} class="block flex-1 rounded-full p-0">+5m</Button>
		<Button onclick={() => addOffset(10)} class="block flex-1 rounded-full p-0">+10m</Button>
		<Button onclick={() => addOffset(60)} class="block flex-1 rounded-full p-0">+1h</Button>
	</div>

	{#if isInvalid}
		<span class="text-red-400">Time can not be in the past</span>
	{/if}
</div>
