<script lang="ts">
	import Image from '../Misc/Image.svelte';
	import SvgImage from '../SVG/SvgImage.svelte';
	import SvgChevronRight from './../SVG/SvgChevronRight.svelte';

	let {
		title = '',
		imageSrc = '',
		alt = 'Card image',
		class: className = '',
		size = 'md',
		selectable = false,
		selected = false,
		amount = 0,
		ontoggle,
		onamount,
		onclick,
		...restProps
	}: {
		title?: string;
		imageSrc: string | null;
		alt: string;
		class?: string;
		size?: 'sm' | 'md' | 'lg';
		selectable?: boolean;
		selected?: boolean;
		amount?: number;
		ontoggle?: () => void;
		onamount?: (delta: number) => void;
		onclick?: () => void;
	} = $props();

	const divSizeStyle = {
		sm: 'max-w-30 min-w-30',
		md: 'max-w-42 min-w-42',
		lg: 'max-w-48 min-w-48'
	};

	let imageLoaded = $state(false);
	let imageError = $state(false);
	const showPlaceholder = $derived(!imageSrc || !imageLoaded || imageError);

	$effect(() => {
		imageSrc;
		imageLoaded = false;
		imageError = false;
	});

	function handleClick() {
		if (selectable) ontoggle?.();
		else onclick?.();
	}
</script>

<div
	{...restProps}
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
	class="flex {divSizeStyle[size]} relative h-fit cursor-pointer touch-manipulation flex-col
        overflow-hidden rounded-3xl border-2 border-200 bg-200
	shadow-sm transition-all
        hover:shadow-md active:scale-95 {className}"
>
	<div class="relative aspect-5/4 h-full w-full overflow-hidden">
		<Image src={imageSrc} {alt} class="aspect-5/4 w-full" />

		<div class="absolute bottom-0 h-[65%] w-full">
			<div
				class="absolute inset-0 h-[101%] backdrop-blur-lg"
				style="mask-image: linear-gradient(to bottom, transparent, black); -webkit-mask-image: linear-gradient(to bottom, transparent, black);"
			></div>
			<div
				class="absolute inset-0 h-[101%] bg-linear-to-b/oklch from-transparent to-black/80"
			></div>
			<div class="relative mt-auto flex h-full w-full flex-row items-end pr-1.5 pb-2 pl-2.5">
				<h3 class="max-w-[90%] min-w-0 truncate text-sm font-semibold text-light">{title}</h3>
				<span class="absolute right-1 bottom-1.5 aspect-square h-6 stroke-light">
					<SvgChevronRight />
				</span>
			</div>
		</div>
	</div>
</div>
