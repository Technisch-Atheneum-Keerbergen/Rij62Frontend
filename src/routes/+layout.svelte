<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import Button from '$lib/components/Button.svelte';
	import './layout.css';
	import 'flowbite/dist/flowbite.css';
	import favicon from '$lib/assets/favicon.svg';

	$: activeUrl = $page.url.pathname;

	const navItems = [
		{ name: 'Home', href: '/', reqAuth: false },
		{ name: 'Admin Overview', href: '/admin/overview', reqAuth: true }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Rij 62</title>
</svelte:head>

<header class="sticky top-0 z-50 hidden w-full px-4 pt-4 md:block">
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
							on:click={() => {
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
						active={activeUrl === item.href}
						activeClass="text-white md:text-white font-bold border-b-2 border-white md:border-b-2"
						nonActiveClass="text-primary-100 hover:text-white transition-colors"
					>
						{item.name}
					</NavLi>
				{/if}
			{/each}
		</NavUl>
	</Navbar>
</header>

<header>
	{#if $auth.user}
		<div class="flex items-center gap-4">
			<div class="hidden flex-col items-end sm:flex">
				<span class="text-sm font-medium text-white">{$auth.user.displayName}</span>
				<button
					on:click={() => {
						auth.logout();
						goto('/login');
					}}
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
			on:click={() => {
				goto('/login');
			}}
		>
			Login
		</Button>
	{/if}
</header>

<main class="container mx-auto min-h-[80vh] p-6">
	<slot />
</main>

<footer class="mt-auto py-8 text-center text-sm text-gray-500 dark:text-gray-400">
	<div class="mx-auto max-w-screen-xl px-4">
		<hr class="mb-6 border-gray-200 dark:border-gray-700" />
		<p>© 2026 Rij 62. All rights reserved.</p>
	</div>
</footer>
