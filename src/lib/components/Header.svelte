<script lang="ts">
  import Button from './Button.svelte';
</script>

<header class="bg-brand-dark text-white py-4 px-6 shadow-md sticky top-0 z-50">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <a href="/" class="flex items-center gap-2">
      <span class="text-2xl font-bold tracking-tight">Rij62</span>
    </a>

    <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
      <a href="/" class="text-gray-300 hover:text-white transition-colors">Menu</a>
      <a href="/orders" class="text-gray-300 hover:text-white transition-colors">Orders</a>
      <a href="/about" class="text-gray-300 hover:text-white transition-colors">Our Story</a>
    </nav>

    <div class="flex items-center gap-4">
      <a href="/login" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</a>
      <Button variant="primary" class="text-sm">Order Now</Button>
    </div>
  </div>
</header>
