<script>
  export let label;
  export let href;
  export let currentRoute;
</script>

{#if currentRoute.name === href}
  <a
    {href}
    class="bg-gray-900 text-white px-3 py-2 whitespace-nowrap rounded-md text-lg font-medium"
    aria-current="page">{label}</a
  >
{:else}
  <a
    {href}
    class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 whitespace-nowrap rounded-md text-lg font-medium"
    aria-current="page">{label}</a
  >
{/if}
