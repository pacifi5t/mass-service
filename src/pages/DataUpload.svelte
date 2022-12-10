<script lang="ts">
  import { FileDropzone, Table } from "attractions";
  import { pretty } from "../utils/helpers";

  const reader = new FileReader();
  const headers = [
    { text: "elem", value: "elem" },
    { text: "n", value: "n" }
    // { text: "freq", value: "freq" },
    // { text: "ecdf", value: "ecdf" }
  ];

  let uplodedFiles = [];
  let tableItemArray = [];
  // let immutableSamples: VarSeries[];
  let attributeHeaders = [];

  // fileStore.subscribe((value) => {
  //   uplodedFiles = value;
  // });
  // immutableSamplesStore.subscribe((value) => {
  //   immutableSamples = value;
  // });
  // attributesStore.subscribe((value) => {
  //   attributeHeaders = value;
  // });

  // $: {
  //   if (immutableSamples.length != 0) {
  //     for (let i = 0; i < immutableSamples.length; i++) {
  //       const items = [];
  //       for (let j = 0; j < immutableSamples[i].data.length; j++) {
  //         const elem = immutableSamples[i];
  //         items.push({
  //           elem: pretty(elem.data[j]),
  //           n: pretty(elem.count.get(j))
  //           // freq: pretty(elem.frequency.get(j)),
  //           // ecdf: pretty(elem.empDistrFunc.get(j))
  //         });
  //       }
  //       tableItemArray.push(items);
  //     }
  //   }
  // }

  function fileUploadHandler(event) {
    // fileStore.set(event.detail.files);

    // if (uplodedFiles.length == 0) {
    //   immutableSamplesStore.set([]);
    //   tableItemArray = [];
    //   return;
    // }

    reader.readAsText(uplodedFiles[0]);
    reader.onload = () => {
      let fileContents: string[][] = reader.result
        .toString()
        .replaceAll("\r", "")
        .split("\n")
        .filter((value) => value !== "")
        .map((value) => {
          return value
            .trim()
            .split(/ |\t/)
            .filter((value) => value !== "");
        });

      const firstRowIsHeaders = Number.isNaN(
        Number.parseFloat(fileContents[0][0])
      );
      if (firstRowIsHeaders) {
        attributeHeaders = fileContents[0];
      } else {
        const headers = [];
        for (let i = 0; i < fileContents[0].length; i++) {
          headers.push(`ATTR${i + 1}`);
        }
        attributeHeaders = headers;
      }

      // attributesStore.set(attributeHeaders);

      const dataSamples = <number[][]>[];
      for (let i = 0; i < fileContents[0].length; i++) {
        const sample = <number[]>[];
        let j = firstRowIsHeaders ? 1 : 0;
        for (; j < fileContents.length; j++) {
          sample.push(Number.parseFloat(fileContents[j][i]));
        }
        dataSamples.push(sample);
      }

      // immutableSamplesStore.set(
      //   dataSamples.map((value) => {
      //     return new VarSeries(value);
      //   })
      // );
    };
  }
</script>

<div class="text-xl font-bold">
  <FileDropzone
    accept="*"
    max={1}
    files={uplodedFiles}
    on:change={fileUploadHandler}
  />
</div>

<!-- {#if immutableSamples.length !== 0}
  <div class="grid grid-cols-7 gap-y-8 mt-10">
    {#each tableItemArray as tableItems, i}
      <div class="flex flex-col">
        <span class="mx-auto">{attributeHeaders[i]}</span>
        <Table class="px-4" {headers} items={tableItems} />
      </div>
    {/each}
  </div>
{/if} -->
<style>
  div {
    max-height: 640px;
  }
</style>
