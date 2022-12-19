<script lang="ts">
  export let currentRoute: any;

  import { Route } from "svelte-router-spa";
  import NavItem from "./NavItem.svelte";
</script>

<nav class="bg-gray-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center h-16">
      <div class="flex-shrink-0">
        <img class="h-8 w-8" src="/vite.svg" alt="Vite" />
      </div>
      <div class="md:block grow">
        <div class="ml-10 flex items-baseline space-x-4">
          <NavItem label="Data upload" href="/" {currentRoute} />
          <NavItem label="Parameters" href="/params" {currentRoute} />
          <NavItem label="Intensity" href="/intensity" {currentRoute} />
        </div>
      </div>
    </div>
  </div>
</nav>

<main>
  <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
    <Route {currentRoute} />
  </div>
</main>
