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

  let sigIntItems = [];
  const sigIntHeaders = [
    { text: "sign intesity", value: "i" },
    { text: "conf interval", value: "l" },
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
    sigIntItems = [];

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

    // console.log(classified);

    const params = approxFunc(classified);
    const sig = math.SignificantIntensities.fromClassifiedTau(classified);
    // console.log(sig);

    for(let i = 0; i < sig.intensities.length; i++) {
      const inten = sig.intensities[i];
      const interval = math.intensityConfInterval(inten.value, inten.classSize);
      sigIntItems.push({
        i: round(inten.value),
        l: `${round(interval[0])} ; ${round(interval[1])}`,
      })
    }

    piecewiseIntensityChart("intensity", tauArr, classified, sig, params);
    approxFuncChart("approx", classified, sig, params);
  }

  function approxFunc(classified: math.ClassifiedTau) {
    argItems = [];

    const minTau = d3.min(tauArr);
    const intensities = classified.intensities.map((e) => e.value);
    const a = math.approxP1(intensities, classified.classWidth, minTau);
    const b = math.approxP2(intensities, classified.classWidth, minTau);

    argItems.push({ a: round(a), b: round(b) });
    return { a, b };
  }
</script>

{#if tauArr.length !== 0}
  <div>
    <ClassSwitcher on:update={(event) => classifyTau(event.detail)} />
    <div class="grid grid-cols-2 gap-4">
      <div>
        <Table headers={intenHeaders} items={intenItems} />
        <Table headers={sigIntHeaders} items={sigIntItems} />
        <Table headers={argHeaders} items={argItems} />
      </div>
      <div>
        <div id="intensity" />
        <div class="ml-8 pb-12">
          <p class="text-indigo-800">- Piecewise intensity function</p>
          <p class="text-red-500">- Probable piecewise intensity function</p>
          <p>- Continuous intensity function</p>
        </div>
        <div id="approx" />
        <div class="ml-8 pb-12">
          <p class="text-red-500">- Spline exp distribution function</p>
          <p>- Exp distribution function</p>
        </div>
      </div>
    </div>
  </div>
{/if}
