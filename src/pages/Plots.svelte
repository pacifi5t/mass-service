<script lang="ts">
  import { onMount } from "svelte";
  import * as charts from "../charts";
  import * as sys from "../service-system";
  import { demandsStore, demandsCountStore, configStore } from "../stores";

  const config = $configStore;
  config.analysisPeriod = 1;

  const demands = $demandsStore
    .slice(0, $demandsCountStore)
    .filter((e) => e.pushTime < config.uptime);

  onMount(() => {
    const res = sys.modelOneChannel(config, demands);
    const items = sys.analyze(demands, res, sys.genAnalysisTimeArr(config));
    createPlots(items);
  });

  function createPlots(items: sys.AnalysisItem[]) {
    charts.idleLoadedTimePlot("idle-loaded", items);
    charts.idleLoadedProbPlot("idle-loaded-prob", items);
    charts.demandsPlot("serviced-not-system", items);
    charts.averageTimePlot("avg-time", items);
  }
</script>

<div class="grid grid-cols-2 grid-rows-2 gap-4 mt-8">
  <div>
    <div id="idle-loaded" />
    <div class="ml-8">
      <p class="text-green-600">- Load time</p>
      <p class="text-red-500">- Idle time</p>
    </div>
  </div>
  <div>
    <div id="idle-loaded-prob" />
    <div class="ml-8">
      <p class="text-green-600">- Load probability</p>
      <p class="text-red-500">- Idle probability</p>
    </div>
  </div>
  <div>
    <div id="serviced-not-system" />
    <div class="ml-8">
      <p class="text-green-600">- Serviced</p>
      <p class="text-red-500">- Not serviced</p>
      <p class="text-indigo-800">- In system</p>
    </div>
  </div>
  <div>
    <div id="avg-time" />
    <div class="ml-8">
      <p class="text-green-600">- Avg time in queue</p>
      <p class="text-red-500">- Avg service time</p>
      <p class="text-indigo-800">- Avg time in system</p>
    </div>
  </div>
</div>
