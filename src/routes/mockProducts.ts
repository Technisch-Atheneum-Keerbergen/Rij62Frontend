import type { Product } from '$lib/api/types/product';

export const mockProducts: Product[] = [
	// ---------------- DRINKS ----------------
	{
		id: 1,
		title: { English: 'Cappuccino', Dutch: 'Cappuccino' },
		description: {
			English: 'Fresh espresso with steamed milk and foam.',
			Dutch: 'Verse espresso met gestoomde melk en schuim.'
		},
		price: 3.2,
		btw: 6,
		stock: 25,
		isAvailable: true,
		imgURL: '/images/cappuccino.jpg',
		categoryId: 2,
		steps: []
	},

	{
		id: 2,
		title: { English: 'Latte', Dutch: 'Latte' },
		description: {
			English: 'Smooth coffee with lots of steamed milk.',
			Dutch: 'Zachte koffie met veel gestoomde melk.'
		},
		price: 3.5,
		btw: 6,
		stock: 20,
		isAvailable: true,
		imgURL: '/images/latte.jpg',
		categoryId: 2,
		steps: [
			{
				id: 201,
				title: { English: 'Milk choice', Dutch: 'Melk keuze' },
				multipleChoice: false,
				defaultOptionId: 21,
				options: [
					{
						id: 21,
						title: { English: 'Regular milk', Dutch: 'Gewone melk' },
						description: { English: '', Dutch: '' },
						price: 0,
						btw: 6,
						stock: 999,
						isAvailable: true,
						imgURL: '/images/milk.jpg',
						categoryId: 2,
						steps: []
					},
					{
						id: 22,
						title: { English: 'Oat milk', Dutch: 'Havermelk' },
						description: { English: '', Dutch: '' },
						price: 0,
						btw: 6,
						stock: 999,
						isAvailable: true,
						imgURL: '/images/oatmilk.jpg',
						categoryId: 2,
						steps: []
					}
				]
			}
		]
	},

	// ---------------- FOOD ----------------
	{
		id: 3,
		title: { English: 'Cheese Sandwich', Dutch: 'Kaasbroodje' },
		description: {
			English: 'Crispy bread with melted cheese.',
			Dutch: 'Knapperig broodje met gesmolten kaas.'
		},
		price: 4.5,
		btw: 6,
		stock: 12,
		isAvailable: true,
		imgURL: '/images/sandwich.jpg',
		categoryId: 0,
		steps: []
	},

	{
		id: 4,
		title: { English: 'Chicken Wrap', Dutch: 'Kip Wrap' },
		description: {
			English: 'Grilled chicken with fresh vegetables.',
			Dutch: 'Gegrilde kip met verse groenten.'
		},
		price: 6.8,
		btw: 6,
		stock: 10,
		isAvailable: true,
		imgURL: '/images/wrap.jpg',
		categoryId: 0,
		steps: [
			// STEP 1 (single choice)
			{
				id: 401,
				title: { English: 'Choose your sauce', Dutch: 'Kies je saus' },
				multipleChoice: false,
				defaultOptionId: 41,
				options: [
					{
						id: 41,
						title: { English: 'Garlic sauce', Dutch: 'Looksaus' },
						description: { English: '', Dutch: '' },
						price: 0,
						btw: 6,
						stock: 999,
						isAvailable: true,
						imgURL: '/images/garlic.jpg',
						categoryId: 1,
						steps: []
					},
					{
						id: 42,
						title: { English: 'Spicy sauce', Dutch: 'Pittige saus' },
						description: { English: '', Dutch: '' },
						price: 0,
						btw: 6,
						stock: 999,
						isAvailable: true,
						imgURL: '/images/spicy.jpg',
						categoryId: 1,
						steps: []
					}
				]
			},

			// STEP 2 (multiple choice)
			{
				id: 402,
				title: { English: 'Extra toppings', Dutch: 'Extra toppings' },
				multipleChoice: true,
				defaultOptionId: null,
				options: [
					{
						id: 43,
						title: { English: 'Extra cheese', Dutch: 'Extra kaas' },
						description: { English: '', Dutch: '' },
						price: 1,
						btw: 6,
						stock: 999,
						isAvailable: true,
						imgURL: '/images/cheese.jpg',
						categoryId: 1,
						steps: []
					},
					{
						id: 44,
						title: { English: 'Avocado', Dutch: 'Avocado' },
						description: { English: '', Dutch: '' },
						price: 1.5,
						btw: 6,
						stock: 999,
						isAvailable: true,
						imgURL: '/images/avocado.jpg',
						categoryId: 1,
						steps: []
					}
				]
			}
		]
	},

	// ---------------- SNACKS ----------------
	{
		id: 5,
		title: { English: 'Chocolate Muffin', Dutch: 'Chocolade Muffin' },
		description: {
			English: 'Soft muffin with rich chocolate.',
			Dutch: 'Zachte muffin met rijke chocolade.'
		},
		price: 2.8,
		btw: 6,
		stock: 15,
		isAvailable: true,
		imgURL: '/images/muffin.jpg',
		categoryId: 1,
		steps: []
	}
];
