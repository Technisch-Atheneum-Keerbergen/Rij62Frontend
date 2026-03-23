<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { auth } from '$lib/stores/auth';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import Button from '$lib/components/Button.svelte';
	import './layout.css';
	import 'flowbite/dist/flowbite.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { Snippet } from 'svelte';
	import UserMenu from '$lib/components/Misc/UserMenu.svelte';
	import SvgMenu from '$lib/components/SVG/SvgMenu.svelte';
	import { cubicInOut } from 'svelte/easing';

	let { children }: { children: Snippet } = $props();

	const navItems = [
		{ name: 'Home', href: '/', reqAuth: false },
		{ name: 'Admin Overview', href: '/admin/overview', reqAuth: true }
	];

	let sideMenuIsOpen = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Rij 62</title>
</svelte:head>

<header class="sticky top-0 z-50 hidden w-full px-4 pt-4 md:hidden">
	<Navbar
		class="rounded-xl border border-white/10 bg-primary-700/90 px-4 py-2.5 shadow-lg backdrop-blur-md"
		fluid={true}
	>
		<NavBrand href="/" class="flex items-center gap-3">
			<img src={favicon} class="h-8 transition-transform hover:scale-110" alt="Rij 62 Logo" />
			<span class="self-center text-xl font-bold tracking-tight text-white"> Rij 62 </span>
		</NavBrand>

		<div class="flex items-center md:order-2">
			{#if $auth.user}
				<div class="flex items-center gap-4">
					<div class="hidden flex-col items-end sm:flex">
						<span class="text-sm font-medium text-white">{$auth.user.displayName}</span>
						<button
							onclick={() => {
								auth.logout();
								goto('/login');
							}}
							class="text-xs text-primary-200 underline-offset-4 hover:underline"
						>
							Sign out
						</button>
					</div>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full border border-primary-500 bg-primary-600 font-bold text-white"
					>
						{$auth.user.displayName?.charAt(0) || 'U'}
					</div>
				</div>
			{:else}
				<Button
					size="sm"
					color="light"
					href="/login"
					class="font-semibold shadow-sm transition-all hover:bg-white hover:text-primary-700"
				>
					Login
				</Button>
			{/if}
			<NavHamburger class="ml-2 text-white hover:bg-primary-600" />
		</div>

		<NavUl class="md:bg-transparent">
			{#each navItems as item}
				{#if !item.reqAuth || $auth.user}
					<NavLi
						href={item.href}
						class={page.url.pathname === item.href
							? 'border-b-2 border-white font-bold text-white'
							: 'text-primary-100 transition-colors hover:text-white'}
					>
						{item.name}
					</NavLi>
				{/if}
			{/each}
		</NavUl>
	</Navbar>
</header>

<header class="fixed top-0 z-20 w-full px-4 pt-3">
	<div class="flex items-center justify-between rounded-2xl px-4 py-2">
		<div class="flex items-center">
			<div class="hidden md:block">
				<UserMenu />
			</div>
		</div>

		<div class="relative h-8 w-8">
			<button
				class="stroke-main absolute flex h-10 w-10 items-center justify-center rounded-xl"
				onclick={() => (sideMenuIsOpen = true)}
			>
				<SvgMenu />
			</button>
			{#if sideMenuIsOpen}
				<!-- overlay -->
				<div
					class="fixed inset-0 z-10"
					onclick={() => (sideMenuIsOpen = false)}
					transition:fade={{ duration: 100 }}
					onkeydown={(e) => e.key === 'Escape' && (sideMenuIsOpen = false)}
					role="button"
					tabindex="0"
				></div>

				<!-- drawer -->
				<aside
					class=" z-20 h-screen bg-100 p-6 shadow-xl"
					transition:fly={{ x: 300, duration: 200 }}
				>
					<div class="mb-6">
						<UserMenu />
					</div>

					<nav class="flex flex-col gap-3">
						{#each navItems as item}
							{#if !item.reqAuth || $auth.user}
								<a
									href={item.href}
									class="rounded-lg px-3 py-2 text-sm font-medium hover:bg-200"
									onclick={() => (sideMenuIsOpen = false)}
								>
									{item.name}
								</a>
							{/if}
						{/each}
					</nav>
				</aside>
			{/if}
		</div>
	</div>
</header>

<main class="container mx-auto mt-8 min-h-[80vh] p-2">{@render children()}</main>

<footer class="text-muted mt-auto py-8 text-center text-sm">
	<div class="mx-auto max-w-7xl px-4">
		<hr class="mb-4 border-200" />
		<p>© {new Date().getFullYear()} Rij 62. All rights reserved.</p>
	</div>
</footer>
