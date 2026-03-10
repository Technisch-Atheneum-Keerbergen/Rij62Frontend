<script lang="ts">
	import { Heading, P, Button, Span } from 'flowbite-svelte';
	import { ArrowRightOutline } from 'flowbite-svelte-icons';
</script>

<div class="text-center">
	<Heading tag="h1" class="mb-4">
		We invest in the best 
    <Span underline class="decoration-blue-400 decoration-8 dark:decoration-blue-600">
			Coffee Experience
		</Span>
	</Heading>
	<P class="mb-6 text-lg sm:px-16 lg:text-xl xl:px-48 dark:text-gray-400">
		Here at Rij 62, we are committed to offer the best possible coffee experience. We believe in the
		power of love to transform the way we enjoy our daily cup of coffee.
	</P>
	<Button href="/">
		Learn more
		<ArrowRightOutline class="ms-2 h-6 w-6" />
	</Button>
</div>
