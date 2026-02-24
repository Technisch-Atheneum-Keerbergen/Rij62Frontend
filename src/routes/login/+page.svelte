<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
</script>

<div class="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-brand-bg">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-brand-dark mb-2">Rij62 Platform</h1>
      <p class="text-gray-500">Sign in to manage your coffee orders</p>
    </div>

    <Card class="border-t-4 border-t-brand-primary shadow-xl">
      <form class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-semibold text-gray-700 mb-1.5">Work Email</label>
          <input 
            type="email" 
            id="email" 
            class="w-full px-4 py-2.5 bg-gray-50 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
            placeholder="name@company.com"
          />
        </div>

        <div>
          <div class="flex justify-between items-center mb-1.5">
            <label for="password" class="block text-sm font-semibold text-gray-700">Password</label>
            <a href="/reset" class="text-xs text-brand-primary hover:underline font-medium">Reset password?</a>
          </div>
          <input 
            type="password" 
            id="password" 
            class="w-full px-4 py-2.5 bg-gray-50 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <div class="flex items-center">
          <input type="checkbox" id="remember" class="w-4 h-4 text-brand-primary border-brand-border rounded focus:ring-brand-primary" />
          <label for="remember" class="ml-2 text-sm text-gray-600">Stay signed in for 30 days</label>
        </div>

        <Button type="submit" variant="primary" class="w-full py-3">
          Sign In
        </Button>
      </form>

      <div class="mt-8 pt-6 border-t border-brand-border text-center">
        <p class="text-sm text-gray-500">
          Need an account? 
          <a href="/contact" class="text-brand-primary font-bold hover:underline">Talk to sales</a>
        </p>
      </div>
    </Card>
  </div>
</div>
