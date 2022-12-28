<script lang="ts">
  import { Slider } from "attractions";

  export let label: string;
  export let value: number;
  export let min: number;
  export let max: number;
  export let step: number;
</script>

<div class="mx-8 mt-14 mb-2">
  <Slider bind:value {min} {max} {step} tooltips="always" />
  <p>{label}</p>
</div>
