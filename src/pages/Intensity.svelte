<script lang="ts">
  import { classCountStore, immutableDataStore } from "../utils/stores";
  import * as mymath from "../math";
  import { Button, Table } from "attractions";
  import * as d3 from "d3";
  import { pretty } from "../utils/helpers";
  import plus from "../assets/plus-circle.svg";
  import minus from "../assets/minus-circle.svg";
  import { onMount } from "svelte";
  import { piecewiseIntensityChart, approxFuncChart } from "../utils/charts";

  const data = $immutableDataStore;
  let classCount = $classCountStore;

  classCountStore.subscribe((value) => (classCount = value));

  let items1 = [];
  const headers1 = [
    { text: "class", value: "c" },
    { text: "intesity", value: "i" },
    { text: "conf interval", value: "l" },
    { text: "dispersion", value: "d" }
  ];

  let items2 = [];
  const headers2 = [
    { text: "Param a", value: "a" },
    { text: "Param b", value: "b" }
  ];

  onMount(() => {
    if (data.length !== 0) {
      classifyTau(classCount);
    }
  });

  function classifyTau(classes: number) {
    items1 = [];
    const min = d3.min(data);
    const max = d3.max(data);
    const classWidth = (max - min) / classes;

    const classifiedTau: number[][] = new Array();
    for (let i = 0; i < classes; i++) {
      classifiedTau.push([]);
    }

    for (let i = 0; i < data.length; i++) {
      let elem = data[i];
      for (let j = 1; j <= classes; j++) {
        const classLim = min + j * classWidth;
        if (classLim >= elem) {
          classifiedTau[j - 1].push(elem);
          break;
        }
      }
    }

    const intensities = mymath.streamIntesities(
      data.length,
      classes,
      classifiedTau,
      classWidth
    );
    for (let i = 0; i < classes - 1; i++) {
      const intensity = intensities[i];
      const confInterval = mymath.intensityConfInterval(
        intensity,
        classifiedTau[i].length
      );
      items1.push({
        c: i + 1,
        l: `${pretty(confInterval[0])} ; ${pretty(confInterval[1])}`,
        i: pretty(intensity),
        d: pretty(mymath.dispersion(classifiedTau[i]))
      });
    }

    approxFunc(data, intensities, classWidth);
    piecewiseIntensityChart(data, classifiedTau, intensities, classWidth);
  }

  function approxFunc(
    data: number[],
    intensities: number[],
    classWidth: number
  ) {
    items2 = [];

    const minTau = d3.min(data);
    const a = mymath.approxP1(intensities, classWidth, minTau);
    const b = mymath.approxP2(intensities, classWidth, minTau);

    items2.push({ a: pretty(a), b: pretty(b) });
    approxFuncChart(data, a, b);
  }
</script>

{#if data.length !== 0}
  <div>
    <div class="flex space-x-4">
      <div class="flex space-x-4 flex-grow">
        <span class="py-4 text-2xl font-medium">Class count</span>
        <Button
          on:click={() => {
            classCountStore.update((old) => (old > 1 ? old - 1 : old));
            classifyTau(classCount);
          }}
        >
          <img src={minus} alt="Sub" />
        </Button>
        {#if classCount >= 0}
          <span class="py-4 text-2xl font-medium">{classCount}</span>
        {/if}
        <Button
          on:click={() => {
            classCountStore.update((old) => old + 1);
            classifyTau(classCount);
          }}
        >
          <img src={plus} alt="Add" />
        </Button>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <Table headers={headers1} items={items1} />
        <Table headers={headers2} items={items2} />
      </div>
      <div>
        <div id="intensity" />
        <div id="approx" />
      </div>
    </div>
  </div>
{/if}
