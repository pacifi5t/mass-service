import { range } from "d3";
import { writable } from "svelte/store";
import { Config, Demand } from "./service-system";
import { modelExpRandomValue, modelWeibullRandomValue, round } from "./math";

export const fileStore = writable([]);

export const immutableDataStore = writable([]);

export const classCountStore = writable(0);

immutableDataStore.subscribe((value) => {
  if (value.length == 0) {
    classCountStore.set(0);
    return;
  }

  const classCount = Math.floor(1 + 3.32 * Math.log10(value.length));
  classCountStore.set(classCount);
});

const delays = range(200).map(() => round(modelExpRandomValue(0.5)));
const durations = range(200).map(() => round(modelWeibullRandomValue(2.5, 1)));
const demands = delays.map((e, i) => new Demand(e, durations[i]));
export const demandsStore = writable(demands);

export const demandsCountStore = writable(10);

export const configStore = writable(Config.default());
