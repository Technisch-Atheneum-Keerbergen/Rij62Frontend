<script lang="ts">
  let { children, class: className = '', ...props } = $props<{
    children?: import('svelte').Snippet;
    class?: string;
    [key: string]: any;
  }>();
</script>

<div class="card {className}" {...props}>
  {#if children}
    {@render children()}
  {/if}
</div>
