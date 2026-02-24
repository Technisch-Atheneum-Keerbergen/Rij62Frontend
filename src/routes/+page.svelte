<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
</script>

<section class="bg-brand-dark text-white py-20 px-6">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
    <div class="flex-1 space-y-8">
      <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight">
        Rij62 <br/> <span class="text-brand-primary">Coffee Solutions</span>
      </h1>
      <p class="text-xl text-gray-400 max-w-xl">
        The ultimate platform for coffee shop management and customer orders. Fast, reliable, and professional.
      </p>
      <div class="flex gap-4">
        <Button variant="primary" class="px-8 py-3 text-lg">Order Now</Button>
        <Button variant="ghost" class="px-8 py-3 text-lg text-white border border-gray-700 hover:bg-gray-800">Learn More</Button>
      </div>
    </div>
    <div class="flex-1">
      <div class="bg-brand-darker rounded-2xl p-8 border border-gray-800 shadow-2xl">
        <div class="flex gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div class="space-y-4 font-mono text-sm">
          <p class="text-emerald-400">$ rij62 status</p>
          <p class="text-gray-400">Coffee Roast: <span class="text-white">Medium-Dark</span></p>
          <p class="text-gray-400">Inventory: <span class="text-white">94%</span></p>
          <p class="text-gray-400">Active Orders: <span class="text-white">12</span></p>
          <p class="text-brand-primary">_</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-20 px-6 max-w-7xl mx-auto">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <Card>
      <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold mb-3">Lightning Fast</h3>
      <p class="text-gray-600 mb-4">Orders are processed in real-time, ensuring zero delay between customer and barista.</p>
      <a href="/features" class="text-brand-primary font-medium hover:underline">Read more →</a>
    </Card>

    <Card>
      <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04kM12 20.944a11.955 11.955 0 01-8.618-3.04A11.952 11.952 0 0012 21.235c4.168 0 7.844-2.128 10.009-5.331" />
        </svg>
      </div>
      <h3 class="text-xl font-bold mb-3">Secure Payments</h3>
      <p class="text-gray-600 mb-4">Enterprise-grade security for every transaction, keeping your customers' data safe.</p>
      <a href="/security" class="text-brand-primary font-medium hover:underline">Read more →</a>
    </Card>

    <Card>
      <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold mb-3">Rich Analytics</h3>
      <p class="text-gray-600 mb-4">Gain insights into your business with our comprehensive dashboard and reports.</p>
      <a href="/analytics" class="text-brand-primary font-medium hover:underline">Read more →</a>
    </Card>
  </div>
</section>
