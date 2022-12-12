import { writable } from "svelte/store";

export const fileStore = writable([]);

export const immutableDataStore = writable([]);

export const classCountStore = writable(3);

immutableDataStore.subscribe((value) => {
  const classCount = Math.floor(1 + 3.32 * Math.log10(value.length));
  classCountStore.set(classCount);
});
