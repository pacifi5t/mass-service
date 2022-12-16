<script lang="ts">
  import { FileDropzone, Table } from "attractions";
  import { fileStore, immutableDataStore } from "../utils/stores";
  import { pretty } from "../utils/helpers";
  import { createDataChart } from "../charts/charts";

  const reader = new FileReader();
  const headers = [
    { text: "№", value: "i" },
    { text: "elem", value: "e" }
  ];

  let uplodedFiles = [];
  let immutableData = [];
  let tableItems = [];

  fileStore.subscribe((value) => {
    uplodedFiles = value;
  });

  immutableDataStore.subscribe((value) => {
    immutableData = value;
    // console.log(immutableData);
  });

  $: {
    if (immutableData.length != 0) {
      tableItems = [];
      for (let i = 0; i < immutableData.length; i++) {
        tableItems.push({
          i: i.toString(),
          e: pretty(immutableData[i])
        });
      }

      setTimeout(() => createDataChart("data", immutableData), 5);
    }
  }
</script>

<div class="text-xl font-bold">
  <FileDropzone
    accept="*"
    max={1}
    files={uplodedFiles}
    on:change={(event) => {
      fileStore.set(event.detail.files);

      if (uplodedFiles.length == 0) {
        immutableDataStore.set([]);
        return;
      }

      reader.readAsText(uplodedFiles[0]);
      reader.onload = () => {
        let str = "" + reader.result;
        let data = [];

        str.split(/\n| /).forEach((value) => {
          const num = Number.parseFloat(value);
          if (!isNaN(num)) {
            data.push(num);
          }
        });

        // console.log(data);
        immutableDataStore.set(data);
      };
    }}
  />
</div>

{#if immutableData.length !== 0}
  <div class="flex flex-row mt-8">
    <div class="overflow-auto flex-1" id="table">
      <Table {headers} items={tableItems} />
    </div>
    <div class="flex-1" id="data" />
  </div>
{/if}

<style>
  #table {
    max-height: 32em;
  }
</style>
