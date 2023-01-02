import { range } from "d3";
import { writable } from "svelte/store";
import { Config, Demand } from "./service-system";
import { modelExpRandomValue, modelWeibullRandomValue, round } from "./math";

const delays = range(200).map(() => round(modelExpRandomValue(0.5)));
const pushTimeArr = delays.map((_, i, arr) =>
  arr.slice(0, i + 1).reduce((total, e) => total + e)
);
const durations = range(200).map(() => round(modelWeibullRandomValue(2.5, 1)));

export const demandsStore = writable(
  pushTimeArr.map((e, i) => new Demand(e, durations[i]))
);

export const demandsCountStore = writable(10);

export const configStore = writable(Config.default());
