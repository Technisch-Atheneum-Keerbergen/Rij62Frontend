<script lang="ts">
	let { message }: { message: string } = $props();

	type Particle = {
		x: number;
		y: number;
		velx: number;
		vely: number;
		color: string;
	};

	var parts: Particle[] = [];
	const particles = $state(parts);
	// particles.push({
	// 	x: 0,
	// 	y: 0,
	// 	velx: 1,
	// 	vely: 10,
	// 	color: colors[Math.random() * colors.length]
	// });

	setInterval(() => {
		for (const part of particles) {
			part.x += part.velx;
			part.y += part.vely;
			part.velx = part.velx * 0.9;
			part.vely = part.vely * 0.9;
			part.vely += 0.1;
		}
	}, 1000);
</script>

<div
	class="center fixed top-1/2 left-1/2 w-3xl -translate-x-1/2 -translate-y-1/2 transform rounded-2xl bg-100 shadow-xl"
>
	<h1 class="text-highlight m-5 text-center text-9xl font-bold">{message}</h1>
	{#each particles as part}
		<div
			class="rounded-full"
			style="background-color:#ff0000; width:10px; height:10px; position:absolute; left: {part.x}; top: {part.y}"
		></div>
	{/each}
</div>
