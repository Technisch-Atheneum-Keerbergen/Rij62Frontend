<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    ghost: 'text-gray-600 hover:bg-gray-100'
  } as const;

  type Variant = keyof typeof variants;

  let {
    type = 'button',
    variant = 'primary' as Variant,
    class: className = '',
    children,
    ...props
  }: {
    type?: 'button' | 'submit' | 'reset';
    variant?: Variant;
    class?: string;
    children?: import('svelte').Snippet;
  } & HTMLButtonAttributes = $props();
</script>

<button
  {type}
  class="btn {variants[variant]} {className}"
  {...props}
>
  {#if children}
    {@render children()}
  {/if}
</button>