<script lang="ts">
  import ConfigSlider from "../components/ConfigSlider.svelte";
  import { demandsStore, demandsCountStore, configStore } from "../stores";
  import { round } from "../math";
  import { Config } from "../service-system";
  import { Table } from "attractions";

  let items = [];
  const headers = [
    { text: "push time", value: "p" },
    { text: "service time", value: "s" }
  ];

  let len = $demandsCountStore;
  let demands = $demandsStore.slice(0, len);
  let { maxQueueLength, initialDemands, uptime, analysisPeriod } = $configStore;

  $: {
    demandsCountStore.set(len);
    configStore.set(
      new Config(maxQueueLength, initialDemands, uptime, analysisPeriod)
    );

    demands = $demandsStore.slice(0, len);
    items = demands.map((e) =>
      Object({ p: round(e.pushTime), s: round(e.serviceTime) })
    );
  }
</script>

<div class="grid grid-cols-2 gap-8 mt-8">
  <div class="">
    <ConfigSlider
      bind:value={maxQueueLength}
      min={1}
      max={20}
      step={1}
      label={"Max queue length"}
    />
    <ConfigSlider
      bind:value={uptime}
      min={10}
      max={200}
      step={0.5}
      label={"System uptime (T)"}
    />
    <ConfigSlider
      bind:value={analysisPeriod}
      min={1}
      max={10}
      step={0.1}
      label={"Data gathering period (dt)"}
    />
    <ConfigSlider
      bind:value={initialDemands}
      min={0}
      max={50}
      step={1}
      label={"Initial demand count"}
    />
  </div>
  <div class="">
    <ConfigSlider
      bind:value={len}
      min={10}
      max={200}
      step={1}
      label={"Data size"}
    />
    <div class="overflow-auto" id="table">
      <Table {items} {headers} />
    </div>
  </div>
</div>

<style>
  #table {
    max-height: 32em;
  }
</style>
