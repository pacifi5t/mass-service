<script lang="ts">
  import { onMount } from "svelte";
  import { Table } from "attractions";
  import * as d3 from "d3";
  import { classCountStore, immutableDataStore } from "../stores";
  import ClassSwitcher from "../components/ClassSwitcher.svelte";
  import * as math from "../math";
  import { round } from "../math";
  import { piecewiseIntensityChart, approxFuncChart } from "../charts/charts";

  const tauArr = $immutableDataStore;
  let classCount = $classCountStore;

  classCountStore.subscribe((value) => (classCount = value));

  let intenItems = [];
  const intenHeaders = [
    { text: "class", value: "c" },
    { text: "intesity", value: "i" },
    { text: "conf interval", value: "l" },
    { text: "dispersion", value: "d" }
  ];

  let argItems = [];
  const argHeaders = [
    { text: "Param a", value: "a" },
    { text: "Param b", value: "b" }
  ];

  onMount(() => {
    if (tauArr.length !== 0) {
      classifyTau(classCount);
    }
  });

  function classifyTau(classes: number) {
    intenItems = [];
    const classified = math.ClassifiedTau.fromTauArr(tauArr, classes);
    for (let i = 0; i < classes - 1; i++) {
      intenItems.push({
        c: i + 1,
        l: `${round(classified.intenConfIntervals[i][0])} ; ${round(
          classified.intenConfIntervals[i][1]
        )}`,
        i: round(classified.intensities[i].value),
        d: round(math.dispersion(classified.taus[i]))
      });
    }

    console.log(classified);

    const params = approxFunc(classified);
    piecewiseIntensityChart("intensity", tauArr, classified, params);
    const sig = math.SignificantIntensities.fromClassifiedTau(classified);
    console.log(sig);
  }

  function approxFunc(classified: math.ClassifiedTau) {
    argItems = [];

    const minTau = d3.min(tauArr);
    const intensities = classified.intensities.map((e) => e.value);
    const a = math.approxP1(intensities, classified.classWidth, minTau);
    const b = math.approxP2(intensities, classified.classWidth, minTau);

    argItems.push({ a: round(a), b: round(b) });
    approxFuncChart("approx", classified, { a, b });
    return { a, b };
  }
</script>

{#if tauArr.length !== 0}
  <div>
    <ClassSwitcher on:update={(event) => classifyTau(event.detail)} />
    <div class="grid grid-cols-2 gap-4">
      <div>
        <Table headers={intenHeaders} items={intenItems} />
        <Table headers={argHeaders} items={argItems} />
      </div>
      <div>
        <div id="intensity" />
        <div id="approx" />
      </div>
    </div>
  </div>
{/if}
