<script lang="ts">
  import { Button } from "attractions";
  import { classCountStore } from "../stores";
  import { createEventDispatcher } from "svelte";

  import plus from "../assets/plus-circle.svg";
  import minus from "../assets/minus-circle.svg";

  const dispatch = createEventDispatcher();
  let classCount = $classCountStore;

  classCountStore.subscribe((value) => (classCount = value));
</script>

<div class="flex space-x-4">
  <div class="flex space-x-4 flex-grow">
    <span class="py-4 text-2xl font-medium">Class count</span>
    <Button
      on:click={() => {
        classCountStore.update((old) => (old > 4 ? old - 1 : old));
        dispatch("update", classCount)
      }}
    >
      <img src={minus} alt="Sub" />
    </Button>
    {#if classCount >= 0}
      <span class="py-4 text-2xl font-medium">{classCount}</span>
    {/if}
    <Button
      on:click={() => {
        classCountStore.update((old) => (old < 10 ? old + 1 : old));
        dispatch("update", classCount)
      }}
    >
      <img src={plus} alt="Add" />
    </Button>
  </div>
</div>
