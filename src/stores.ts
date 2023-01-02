import { range } from "d3";
import { writable } from "svelte/store";
import { Config, Demand } from "./service-system";
import { modelExpRandomValue, modelWeibullRandomValue, round } from "./math";

const delays = range(200).map(() => round(modelExpRandomValue(0.5)));
const durations = range(200).map(() => round(modelWeibullRandomValue(2.5, 1)));

export function generateData(config: Config) {
  const initialPushTimeArr = range(config.initialDemands).map(() => 0);
  const pushTimeArr = delays
    .slice(config.initialDemands)
    .map((_, i, arr) => arr.slice(0, i + 1).reduce((total, e) => total + e));

  return initialPushTimeArr
    .concat(pushTimeArr)
    .map((e, i) => new Demand(e, durations[i]));
}

export const configStore = writable(Config.default());

export const demandsStore = writable(generateData(Config.default()));
configStore.subscribe((config) => demandsStore.set(generateData(config)));

export const demandsCountStore = writable(10);
