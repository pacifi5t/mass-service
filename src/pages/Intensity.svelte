<script lang="ts">
  import { onMount } from "svelte";
  import { Button, Table } from "attractions";
  import * as d3 from "d3";
  import { classCountStore, immutableDataStore } from "../stores";
  import * as math from "../math";
  import { round } from "../math";
  import plus from "../assets/plus-circle.svg";
  import minus from "../assets/minus-circle.svg";
  import { piecewiseIntensityChart, approxFuncChart } from "../charts/charts";

  const data = $immutableDataStore;
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
    if (data.length !== 0) {
      classifyTau(classCount);
    }
  });

  function classifyTau(classes: number) {
    intenItems = [];
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

    const intensities = math.streamIntesities(
      data.length,
      classes,
      classifiedTau,
      classWidth
    );
    for (let i = 0; i < classes - 1; i++) {
      const intensity = intensities[i];
      const confInterval = math.intensityConfInterval(
        intensity,
        classifiedTau[i].length
      );
      intenItems.push({
        c: i + 1,
        l: `${round(confInterval[0])} ; ${round(confInterval[1])}`,
        i: round(intensity),
        d: round(math.dispersion(classifiedTau[i]))
      });
    }

    console.log(classifiedTau);

    approxFunc(data, intensities, classWidth);
    piecewiseIntensityChart(
      "intensity",
      data,
      classifiedTau,
      intensities,
      classWidth
    );
    getSignIntensities(intensities, classifiedTau);
  }

  function getSignIntensities(intensities: any[], classifiedTau: number[][]) {
    const lambdas: math.Intensity[] = [];
    for (let i = 0; i < intensities.length; i++) {
      lambdas.push({
        value: intensities[i],
        classSize: classifiedTau[i].length
      });
    }

    const significantIntesities = [];
    let temp: math.Intensity = undefined;
    for (let i = 0; i < lambdas.length; i++) {
      const elem = lambdas[i];

      if (temp === undefined) {
        const elem2 = lambdas[i + 1];

        if (elem2 === undefined) {
          significantIntesities.push(elem);
          break;
        }

        if (math.classesCanBeMerged(elem, elem2)) {
          temp = math.significantIntensity(elem, elem2);
          i++;
        } else {
          significantIntesities.push(elem);
        }
      } else {
        if (math.classesCanBeMerged(elem, temp)) {
          temp = math.significantIntensity(elem, temp);
        } else {
          significantIntesities.push(temp);
          temp = undefined;
          i--;
        }
      }
    }

    if (temp !== undefined) {
      significantIntesities.push(temp);
    }

    console.log(significantIntesities);
  }

  function approxFunc(
    data: number[],
    intensities: number[],
    classWidth: number
  ) {
    argItems = [];

    const minTau = d3.min(data);
    const a = math.approxP1(intensities, classWidth, minTau);
    const b = math.approxP2(intensities, classWidth, minTau);

    argItems.push({ a: round(a), b: round(b) });
    approxFuncChart("approx", data, { a, b });
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
