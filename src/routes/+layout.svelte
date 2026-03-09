<script lang="ts">
  import './layout.css';
  import 'flowbite/dist/flowbite.css';
  import favicon from '$lib/assets/favicon.svg';
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from "flowbite-svelte";
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Rij 62</title>
</svelte:head>

<header>
  <div class="px-4 mt-4">
    <Navbar class="bg-blue-500 text-white rounded-lg overflow-hidden">
      <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center py-2.5">
        <NavBrand href="/" class="flex items-center">
          <img src={favicon} class="mr-3 h-6 sm:h-9" alt="Rij 62 Logo" />
          <span class="self-center text-xl font-semibold whitespace-nowrap">Rij 62</span>
        </NavBrand>
        <NavHamburger />
        <NavUl class="hidden md:flex space-x-4">
          <NavLi>
            <a href="/" class="text-white hover:text-gray-200">Home</a>
          </NavLi>
          <NavLi>
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

<footer class="mx-1 text-center">
  © 2026
</footer>