import { writable } from "svelte/store";

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
