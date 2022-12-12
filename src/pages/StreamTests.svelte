<script lang="ts">
  import { classCountStore, immutableDataStore } from "../utils/stores";
  import * as mymath from "../math";
  import { Button, Table } from "attractions";
  import { pretty } from "../utils/helpers";
  import plus from "../assets/plus-circle.svg";
  import minus from "../assets/minus-circle.svg";

  const data = $immutableDataStore;
  let classCount = $classCountStore;

  const headers1 = [
    { text: "V", value: "v" },
    { text: "u", value: "u" },
    { text: "SNDQ", value: "u2" },
    { text: "conlusion", value: "c" }
  ];

  const headers2 = [
    { text: "W", value: "w" },
    { text: "u", value: "u" },
    { text: "SNDQ", value: "u2" },
    { text: "conlusion", value: "c" }
  ];

  const headers3 = [
    { text: "class", value: "c" },
    { text: "stream param", value: "u" },
    { text: "limits", value: "l" },
    { text: "dispersion", value: "d" }
  ];

  const items1 = [];
  const items2 = [];
  let items3 = [];

  classCountStore.subscribe((value) => (classCount = value));

  if (data.length !== 0) {
    runTests();
    classifyStream(classCount);
  }

  function classifyStream(classes: number) {
    const tArray = [];
    let temp = 0;
    for (let i = 0; i < data.length; i++) {
      temp += data[i];
      tArray.push(temp);
    }

    const width = data.reduce((total, e) => total + e, 0) / classes;

    const classifiedStreams: number[][] = new Array();
    for (let i = 0; i < classes; i++) {
      classifiedStreams.push([]);
    }

    for (let i = 0; i < tArray.length; i++) {
      let elem = tArray[i];
      for (let j = 1; j <= classes; j++) {
        if (width * j >= elem) {
          classifiedStreams[j - 1].push(elem);
          break;
        }
      }
    }

    items3 = [];
    for (let i = 0; i < classes; i++) {
      const streamStat = mymath.streamStat(
        width,
        classifiedStreams[i].length,
        tArray.length
      );
      const confInterval = mymath.streamStatConfInterval(
        streamStat,
        width,
        classifiedStreams[i].length,
        tArray.length
      );
      items3.push({
        c: i + 1,
        l: `${pretty(confInterval[0])} ; ${pretty(confInterval[1])}`,
        u: pretty(streamStat),
        d: pretty(mymath.dispersion(classifiedStreams[i]))
      });
    }
  }

  function runTests() {
    const v = mymath.valueMannV(data);
    const w = mymath.valueMannW(data);
    let normQuan = Math.abs(mymath.normQuan);

    const vTest = mymath.testMann(data, v);
    items1.push({
      v: v,
      u: pretty(vTest[1]),
      u2: pretty(normQuan),
      c: `Stream is ${vTest[0] ? "" : "not"} simple`
    });

    const wTest = mymath.testMann(data, w);
    items2.push({
      w: w,
      u: pretty(wTest[1]),
      u2: pretty(normQuan),
      c: wTest[0] ? "No interval change trend" : "Interval change trend is here"
    });
  }
</script>

{#if data.length !== 0}
  <div class="flex justify-between">
    <Table headers={headers1} items={items1} />
    <Table headers={headers2} items={items2} />
  </div>

  <div>
    <div class="flex space-x-4">
      <div class="flex space-x-4 flex-grow">
        <span class="py-4 text-2xl font-medium">Class count</span>
        <Button
          on:click={() => {
            classCountStore.update((old) => (old > 1 ? old - 1 : old));
            classifyStream(classCount);
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
            classifyStream(classCount);
          }}
        >
          <img src={plus} alt="Add" />
        </Button>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        {#if classCount !== 0}
          <Table headers={headers3} items={items3} />
        {/if}
      </div>
      <!-- TODO: build chart -->
    </div>
  </div>
{/if}
