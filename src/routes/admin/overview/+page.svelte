<script lang="ts">
	import { Card, Button } from 'flowbite-svelte';
	import { Heading, P, Span } from 'flowbite-svelte';

	const controlTypes = [
		{ type: 'product', description: 'Manage all products and inventory.' },
		{ type: 'screen', description: 'Configure screens and displays.' },
		{ type: 'table', description: 'Edit tables and datasets.' },
		{ type: 'category', description: 'Edit all available categories' }
	];
</script>

<div class="mx-auto max-w-7xl p-8">
	<!-- Heading Section -->
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold  md:text-5xl lg:text-6xl">
			<Span class="text-highlight">Rij 62</Span> Admin Overview
		</Heading>
		<P>
			Here at Rij 62, we are committed to offer the best possible coffee experience. Use the
			controls below to manage products, screens, and tables efficiently.
		</P>
	</div>

	<!-- Dashboard Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		{#each controlTypes as item}
			<Card
				class="rounded-lg border border-none bg-100 transition-shadow duration-300 hover:shadow-xl dark:bg-100"
			>
				<div class="flex h-full flex-col justify-between p-6">
					<h2 class="mb-2 text-xl font-semibold capitalize">{item.type} Control</h2>
					<p class="mb-4 text-gray-500">{item.description}</p>
					<Button
						href={`/admin/${item.type}Control`}
						class="mt-auto bg-primary-500 font-semibold text-white hover:bg-primary-600"
					>
						Go
					</Button>
				</div>
			</Card>
		{/each}
	</div>
</div>
