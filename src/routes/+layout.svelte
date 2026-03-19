<script lang="ts">
	import './layout.css';
	import 'flowbite/dist/flowbite.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Rij 62</title>
</svelte:head>

<header>
	<div class="mt-4 px-4">
		<Navbar class=" hidden overflow-hidden rounded-lg bg-primary-700 text-white md:block">
			<div class="mx-auto flex flex-wrap items-center justify-between py-1">
				<NavBrand href="/" class="flex items-center">
					<img src={favicon} class="mr-3 h-6 sm:h-9" alt="Rij 62 Logo" />
					<span class="self-center text-xl font-semibold whitespace-nowrap">Rij 62</span>
				</NavBrand>
				<NavHamburger />
				<NavUl class="hidden space-x-4 py-0 md:flex">
					<NavLi class="py-0">
						<a href="/" class="text-white hover:text-gray-200">Home</a>
					</NavLi>
					<NavLi class="py-0">
						<a href="/admin/overview" class="text-white hover:text-gray-200">Admin Overview</a>
					</NavLi>
				</NavUl>
			</div>
		</Navbar>
	</div>
</header>

<main class="p-3">
	<slot />
</main>

<footer class="mx-1 text-center dark:text-white">© 2026</footer>
