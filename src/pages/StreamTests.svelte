<script lang="ts">
  import { classCountStore, immutableDataStore } from "../utils/stores";
  import * as mymath from "../math";
  import { Table } from "attractions";
  import { pretty } from "../utils/helpers";

  const data = $immutableDataStore;

  const headers1 = [
    { text: "V", value: "v" },
    { text: "u", value: "u" },
    { text: "norm distib quan", value: "u2" },
    { text: "conlusion", value: "c" }
  ];

  const headers2 = [
    { text: "W", value: "w" },
    { text: "u", value: "u" },
    { text: "norm distib quan", value: "u2" },
    { text: "conlusion", value: "c" }
  ];

  const items1 = [];
  const items2 = [];

  if (data.length !== 0) {
    createTables();
    classifyStream($classCountStore);
  }

  function classifyStream(classCount: number) {
    const tArray = [];
    let temp = 0;
    for (let i = 0; i < data.length; i++) {
      temp += data[i];
      tArray.push(temp);
    }

    const width = data.reduce((total, e) => total + e, 0) / classCount;

    const classifiedStreams: number[][] = new Array();
    for (let i = 0; i < classCount; i++) {
      classifiedStreams.push([]);
    }

    for (let i = 0; i < tArray.length; i++) {
      let elem = tArray[i];
      for (let j = 1; j <= classCount; j++) {
        if (width * j >= elem) {
          classifiedStreams[j - 1].push(elem);
          break;
        }
      }
    }
  }

  function createTables() {
    let v = mymath.valueMannV(data);
    let w = mymath.valueMannW(data);
    let normQuan = Math.abs(mymath.normDistribQuan(mymath.alpha / 2));

    items1.push({
      v: v,
      u: pretty(mymath.testMann(data, v)[1]),
      u2: pretty(normQuan),
      c: "lol"
    });

    items2.push({
      w: w,
      u: pretty(mymath.testMann(data, w)[1]),
      u2: pretty(normQuan),
      c: "lol"
    });
  }
</script>

{#if data.length !== 0}
  <Table headers={headers1} items={items1} />
  <Table headers={headers2} items={items2} />
{/if}
