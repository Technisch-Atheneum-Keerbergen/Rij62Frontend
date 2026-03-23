<!-- src/lib/components/UserMenu.svelte -->
<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
</script>

{#if $auth.user}
	<div class="flex items-center justify-end gap-2">
		<div class="flex flex-col items-end">
			<span class="text-sm font-bold">{$auth.user.displayName}</span>
			<button
				class="cursor-pointer text-sm font-light"
				onclick={() => {
					auth.logout();
					goto('/login');
				}}
			>
				Sign out
			</button>
		</div>
		<div
			class="flex h-10 w-10 items-center justify-center rounded-full border border-primary-500 bg-primary-600 font-bold text-light"
		>
			{$auth.user.displayName?.charAt(0) || 'U'}
		</div>
	</div>
{:else}
	<Button size="sm" onclick={() => goto('/login')}>Login</Button>
{/if}
