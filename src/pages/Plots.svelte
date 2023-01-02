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
  <div id="idle-loaded">idle-loaded</div>
  <div id="idle-loaded-prob">idle-loaded-prob</div>
  <div id="serviced-not-system">serviced-not-system</div>
  <div id="avg-time">avg-time</div>
</div>
