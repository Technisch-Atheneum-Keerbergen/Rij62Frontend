<script>
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Cards/Card.svelte';
	import CheckCard from '$lib/components/Cards/CheckCard.svelte';
	import RadioCard from '$lib/components/Cards/RadioCard.svelte';
</script>

<section class="flex w-full flex-col items-center gap-3">
	<h1>Buttons:</h1>
	<Button type="button" size="md" variant="primary">Primary</Button>
	<Button type="button" variant="secondary">Secondary</Button>
	<Button type="button" variant="ghost">Ghost</Button>

	<h1>Cards:</h1>
	<div class="flex gap-2">
		<Card title="Blueberries" imageSrc="/images/blueberries.jpg" price="20" />
	</div>

	<h2>Radio groups:</h2>
	<div class="flex gap-2">
		<RadioCard group="drinks" title="Coffee" imageSrc="/images/coffee.jpg" price="20" />
		<RadioCard group="drinks" title="Salmon" imageSrc="/images/zalmpje.jpg" price="20" />
	</div>

	<h2>Checkbox groups:</h2>
	<div class="flex gap-2">
		<CheckCard group="other" title="Coffee" imageSrc="/images/coffee.jpg" price="20" />
		<CheckCard group="other" title="Salmon" imageSrc="/images/zalmpje.jpg" price="20" />
	</div>
</section>
