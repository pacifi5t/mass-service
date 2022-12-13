<script lang="ts">
  import { classCountStore, immutableDataStore } from "../utils/stores";
  import * as mymath from "../math";
  import { Button, Table } from "attractions";
  import * as d3 from "d3";
  import { pretty } from "../utils/helpers";
  import plus from "../assets/plus-circle.svg";
  import minus from "../assets/minus-circle.svg";

  const data = $immutableDataStore;
  let classCount = $classCountStore;

  classCountStore.subscribe((value) => (classCount = value));

  let items = [];
  const headers = [
    { text: "class", value: "c" },
    { text: "intesity", value: "i" },
    { text: "conf interval", value: "l" },
    { text: "dispersion", value: "d" }
  ];

  if (data.length !== 0) {
    classifyTau(classCount);
  }

  function classifyTau(classes: number) {
    items = [];
    const min = d3.min(data);
    const max = d3.max(data);
    const width = (max - min) / classes;

    const classifiedTau: number[][] = new Array();
    for (let i = 0; i < classes; i++) {
      classifiedTau.push([]);
    }

    for (let i = 0; i < data.length; i++) {
      let elem = data[i];
      for (let j = 1; j <= classes; j++) {
        if (width * j >= elem) {
          classifiedTau[j - 1].push(elem);
          break;
        }
      }
    }

    const streamIntesities = mymath.streamIntesities(
      data.length,
      classes,
      classifiedTau,
      width
    );
    for (let i = 0; i < classes - 1; i++) {
      const intensity = streamIntesities[i];
      const confInterval = mymath.intensityConfInterval(
        intensity,
        classifiedTau[i].length
      );
      items.push({
        c: i + 1,
        l: `${pretty(confInterval[0])} ; ${pretty(confInterval[1])}`,
        i: pretty(intensity),
        d: pretty(mymath.dispersion(classifiedTau[i]))
      });
    }
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
        <Table {headers} {items} />
      </div>
      <div>
        <!-- TODO: build chart -->
      </div>
    </div>
  </div>
{/if}
