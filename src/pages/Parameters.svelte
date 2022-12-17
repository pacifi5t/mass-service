<script lang="ts">
  import { Button, Table } from "attractions";
  import { classCountStore, immutableDataStore } from "../stores";
  import * as math from "../math";
  import { round } from "../math";
  import plus from "../assets/plus-circle.svg";
  import minus from "../assets/minus-circle.svg";

  const data = $immutableDataStore;
  let classCount = $classCountStore;

  const items1 = [];
  const headers1 = [
    { text: "V", value: "v" },
    { text: "u", value: "u" },
    { text: "SNDQ", value: "u2" },
    { text: "conlusion", value: "c" }
  ];

  const items2 = [];
  const headers2 = [
    { text: "W", value: "w" },
    { text: "u", value: "u" },
    { text: "SNDQ", value: "u2" },
    { text: "conlusion", value: "c" }
  ];

  let items3 = [];
  const headers3 = [
    { text: "class", value: "c" },
    { text: "stream param", value: "u" },
    { text: "conf interval", value: "l" },
    { text: "dispersion", value: "d" }
  ];

  classCountStore.subscribe((value) => (classCount = value));

  if (data.length !== 0) {
    runTests();
    classifyT(classCount);
  }

  function classifyT(classes: number) {
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
      const streamStat = math.streamStat(
        width,
        classifiedStreams[i].length,
        tArray.length
      );
      const confInterval = math.streamStatConfInterval(
        streamStat,
        width,
        classifiedStreams[i].length,
        tArray.length
      );
      items3.push({
        c: i + 1,
        l: `${round(confInterval[0])} ; ${round(confInterval[1])}`,
        u: round(streamStat),
        d: round(math.dispersion(classifiedStreams[i]))
      });
    }
  }

  function runTests() {
    const v = math.valueMannV(data);
    const w = math.valueMannW(data);
    let normQuan = Math.abs(math.normQuan);

    const vTest = math.testMann(data, v);
    items1.push({
      v: v,
      u: round(vTest[1]),
      u2: round(normQuan),
      c: `Stream is ${vTest[0] ? "" : "not"} simple`
    });

    const wTest = math.testMann(data, w);
    items2.push({
      w: w,
      u: round(wTest[1]),
      u2: round(normQuan),
      c: wTest[0] ? "No interval change trend" : "Interval change trend is here"
    });
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
            classifyT(classCount);
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
            classifyT(classCount);
          }}
        >
          <img src={plus} alt="Add" />
        </Button>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <Table headers={headers3} items={items3} />
      </div>
      <div>
        <Table headers={headers1} items={items1} />
        <Table headers={headers2} items={items2} />
      </div>
    </div>
  </div>
{/if}
