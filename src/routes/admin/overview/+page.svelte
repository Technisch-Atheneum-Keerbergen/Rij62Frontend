<script lang="ts">
  import { Card, Button } from "flowbite-svelte";
  import { Heading, P, Span} from "flowbite-svelte";

  const controlTypes = [
    { type: "product", description: "Manage all products and inventory." },
    { type: "screen", description: "Configure screens and displays." },
    { type: "table", description: "Edit tables and datasets." }
  ];
</script>

<div class="p-8 max-w-7xl mx-auto">
  <!-- Heading Section -->
  <div class="mb-12 text-center">
    <Heading tag="h1" class="mb-4 text-3xl font-extrabold  md:text-5xl lg:text-6xl">
      <Span gradient="tealToLime">
        Rij 62
      </Span> Admin Overview
    </Heading>
    <P>
      Here at Rij 62, we are committed to offer the best possible coffee experience. Use the controls below to manage products, screens, and tables efficiently.
    </P>
  </div>

  <!-- Dashboard Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each controlTypes as item}
      <Card class="hover:shadow-xl transition-shadow duration-300 border border-gray-200 rounded-lg">
        <div class="flex flex-col justify-between h-full p-6">
          <h2 class="text-xl font-semibold mb-2 capitalize">{item.type} Control</h2>
          <p class="text-gray-500 mb-4">{item.description}</p>
          <Button href={`/admin/${item.type}Control`} class="mt-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold">
            Go
          </Button>
        </div>
      </Card>
    {/each}
  </div>
</div>