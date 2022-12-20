<script lang="ts">
  import { immutableDataStore } from "../stores";
  import { Table } from "attractions";
  import * as math from "../math";
  import { normQuan, round } from "../math";

  const tableItems = [[], []];
  const headers = [
    { text: "№", value: "i" },
    { text: "elem", value: "e" }
  ];

  const statItems = [];
  const statHeaders = [
    { text: "u", value: "u" },
    { text: "SNDQ", value: "u2" },
    { text: "conlusion", value: "c" }
  ];

  const tauArr: number[] = $immutableDataStore;
  const lim = Math.ceil(tauArr.length / 2);

  const stream1 = tauArr.slice(0, lim);
  const stream2 = tauArr.slice(lim);

  for (let i = 0; i < stream1.length; i++) {
    tableItems[0].push({ i: i + 1, e: stream1[i] });
  }

  for (let i = 0; i < stream2.length; i++) {
    tableItems[1].push({ i: i + 1, e: stream2[i] });
  }

  const uStat = Math.abs(math.poissonUStat(stream1, stream2));

  statItems.push({
    u: round(uStat),
    u2: round(normQuan),
    c: `Streams ${uStat <= normQuan ? "" : "don't "}match`
  });
</script>

{#if tauArr.length !== 0}
  <div class="flex flex-row mt-8 overflow-auto justify-around" id="table">
    {#each tableItems as items, i}
      <div class="flex flex-col ml-10">
        <span>Stream {i + 1}</span>
        <Table {headers} {items} />
      </div>
      <div></div>
    {/each}
    <div>
      <Table headers={statHeaders} items={statItems} />
    </div>
  </div>
{/if}

<style>
  #table {
    max-height: 32em;
  }
</style>
