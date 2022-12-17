<script lang="ts">
  import { onMount } from "svelte";
  import { Table } from "attractions";
  import * as d3 from "d3";
  import { classCountStore, immutableDataStore } from "../stores";
  import ClassSwitcher from "../components/ClassSwitcher.svelte";
  import * as math from "../math";
  import { ClassifiedTau, round } from "../math";
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
    // getSignIntensities(intensities, classifiedTau);
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

  function approxFunc(classified: ClassifiedTau) {
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
