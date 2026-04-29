<script lang="ts">
	import { apiFetch } from '$lib/api/client';
	import type { Order, OrderId, OrderItem, OrderStatus } from '$lib/api/types/order';
	import type { Product, ProductId } from '$lib/api/types/product';
	import { pendingOrderStore } from '$lib/stores/pendingOrders';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	const statusColors: Record<OrderStatus, string> = {
		Pending: 'text-muted',
		InProgress: 'text-secondary-500',
		Ready: 'text-green-500',
		PickedUp: 'text-primary-500'
	};

	const statusNames: Record<OrderStatus, string> = {
		Pending: 'Pending...',
		InProgress: 'Being made...',
		Ready: 'Ready!',
		PickedUp: 'Picked up'
	};

	interface OrderItemDisplay extends OrderItem {
		choiceNames: string;
	}

	interface OrderDisplay extends Order {
		items: OrderItemDisplay[];
	}

	let pendingOrders: OrderDisplay[] = [];

	async function getOrder(id: OrderId): Promise<Order | null> {
		const result = await apiFetch(`/order/${id}`);
		if (!result) return null;
		return result as unknown as Order;
	}

	async function getProductName(id: ProductId): Promise<string | null> {
		const result = await apiFetch(`/product/${id}`);
		if (!result) return null;
		const product = result as unknown as Product;
		return product.title[currentLanguage] ?? null;
	}

	async function resolveChoiceNames(choices: ProductId[]): Promise<string> {
		const names = await Promise.all(choices.map(getProductName));
		return names.filter((name): name is string => name !== null).join(', ');
	}

	async function resolveOrderItem(item: OrderItem): Promise<OrderItemDisplay> {
		return {
			...item,
			choiceNames: await resolveChoiceNames(item.choices)
		};
	}

	async function resolveOrder(order: Order): Promise<OrderDisplay> {
		return {
			...order,
			items: await Promise.all(order.items.map(resolveOrderItem))
		};
	}

	async function updatePendingOrders() {
		const results = await Promise.all($pendingOrderStore.map(getOrder));

		const orders = results
			.filter((order): order is Order => order !== null)
			.sort((a, b) => b.createdTime - a.createdTime);

		pendingOrders = await Promise.all(orders.map(resolveOrder));
	}

	updatePendingOrders();

	setTimeout(updatePendingOrders, 5000);
</script>

<section class="mx-auto max-w-2xl">
	{#each pendingOrders as order}
		{@const date = new Date(order.createdTime * 1000)}
		<div class="mb-1 p-2">
			<h2 class="mb-1 flex items-baseline justify-end text-lg font-bold">
				Order {date.getHours()}:{String(date.getMinutes()).padStart(2, '0')}
				<span class=" ml-auto h-fit text-sm font-light opacity-100">
					{date.getDate()}/{date.getMonth() + 1}
				</span>
			</h2>

			<ul class="flex flex-col gap-2">
				{#each order.items as orderItem}
					<li
						class="flex items-center justify-between rounded-2xl border-2 border-300 bg-200 p-2 shadow-sm"
					>
						<div class="relative flex grow items-center gap-3">
							<img
								src={orderItem.imgUrl}
								alt={orderItem.title[currentLanguage]}
								class="h-12 w-12 rounded-lg object-cover"
							/>
							<span
								class="inset-shadow-lg absolute left-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-xl text-light shadow-md backdrop-blur-[1px]"
								>{orderItem.quantity}</span
							>
							<div>
								<p class="font-medium">{orderItem.title[currentLanguage]}</p>
								{#if orderItem.choices.length > 0}
									<p class="text-muted text-xs opacity-80">{orderItem.choiceNames}</p>
								{/if}
							</div>

							<div
								class="ml-auto font-bold text-nowrap {statusColors[orderItem.status] ??
									'text-gray-500'}"
							>
								{statusNames[orderItem.status]}
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</section>
