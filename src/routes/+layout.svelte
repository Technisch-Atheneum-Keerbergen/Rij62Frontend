<script lang="ts">
	import SvgXmark from './../lib/components/SVG/SvgXmark.svelte';
	import { slide } from 'svelte/transition';
	import { auth } from '$lib/stores/auth';
	import favicon from '$lib/assets/favicon.svg';
	import type { Snippet } from 'svelte';
	import UserMenu from '$lib/components/Misc/UserMenu.svelte';
	import SvgMenu from '$lib/components/SVG/SvgMenu.svelte';
	import './layout.css';

	let { children }: { children: Snippet } = $props();

	const navItems = [
		{ name: 'Rij62', href: '/', reqAuth: false },
		{ name: 'Orders', href: '/orders', reqAuth: false },
		{ name: 'Basket', href: '/basket', reqAuth: false },
		{ name: 'Admin Overview', href: '/admin/overview', reqAuth: true }
	];

	let sideMenuIsOpen = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Rij 62</title>
</svelte:head>

<header class="fixed top-0 z-20 flex w-full justify-center p-2">
	<nav class="w-full max-w-2xl rounded-3xl bg-200/80 px-4 py-2 shadow-lg backdrop-blur-md">
		<div class="flex w-full items-center justify-between">
			<a href="/" class="text-xl font-medium text-primary-500 dark:text-primary-300"
				>Rij<span class="font-bold text-secondary-500 dark:text-secondary-300">62</span></a
			>
			<div class=" hidden items-center gap-6 md:flex">
				<div class="flex flex-row gap-6">
					{#each navItems as item}
						{#if !item.reqAuth || $auth.user}
							<a
								href={item.href}
								class="rounded-lg transition-all hover:text-primary-900 dark:hover:text-primary-200"
								onclick={() => (sideMenuIsOpen = false)}
							>
								{item.name}
							</a>
						{/if}
					{/each}
				</div>
				<div class="flex flex-row rounded-lg">
					<UserMenu />
				</div>
			</div>
			<div class="relative block h-10 w-10 md:hidden">
				<button
					class="stroke-main absolute flex cursor-pointer items-center justify-center rounded-xl transition-all active:scale-95"
					onclick={() => (sideMenuIsOpen = true)}
				>
					{#if sideMenuIsOpen}
						<SvgXmark />
					{:else}<SvgMenu />{/if}
				</button>
			</div>
		</div>
		{#if sideMenuIsOpen}
			<!-- overlay -->
			<div
				class="fixed inset-0 z-30 h-screen"
				onclick={() => (sideMenuIsOpen = false)}
				onkeydown={(e) => e.key === 'Escape' && (sideMenuIsOpen = false)}
				role="button"
				tabindex="0"
			></div>

			<!-- drawer: relative, flows inside header, but visually above overlay via z -->
			<aside class="relative z-40 p-1 text-right font-medium" transition:slide={{ duration: 200 }}>
				<nav class="flex flex-col gap-1">
					<div
						class="rounded-lg px-4 py-3 transition-all hover:bg-300 active:scale-95 active:bg-300"
						role="button"
						tabindex="0"
						onclick={() => (sideMenuIsOpen = false)}
						onkeydown={(e) => e.key === 'Escape' && (sideMenuIsOpen = false)}
					>
						<UserMenu />
					</div>
					{#each navItems as item}
						{#if !item.reqAuth || $auth.user}
							<a
								href={item.href}
								class="rounded-lg px-4 py-3 transition-all hover:bg-300 active:scale-95 active:bg-300"
								onclick={() => (sideMenuIsOpen = false)}
							>
								{item.name}
							</a>
						{/if}
					{/each}
				</nav>
			</aside>
		{/if}
	</nav>
</header>

<main class="container mx-auto mt-16 min-h-[80vh] p-2">{@render children()}</main>

<footer class="text-muted mt-auto py-8 text-center text-sm">
	<div class="mx-auto max-w-7xl px-4">
		<hr class="mb-4 border-200" />
		<p>© {new Date().getFullYear()} Rij 62. All rights reserved.</p>
	</div>
</footer>
