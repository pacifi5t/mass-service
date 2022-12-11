export function shiftedDeviation(array: number[], mean: number) {
  return Math.sqrt(
    array.reduce((total, x) => total + Math.pow(x - mean, 2), 0) / array.length
  );
}

export function meanDeviation(len: number, stdDeviation: number) {
  return stdDeviation / Math.sqrt(len);
}

export function stdDevDeviation(len: number, stdDeviation: number) {
  return meanDeviation(len, stdDeviation) / Math.sqrt(2);
}

export function skewnessDeviation(len: number) {
  return Math.sqrt((6 * len * (len - 1)) / ((len - 2) * (len + 1) * (len + 3)));
}

export function kurtosisDeviation(len: number) {
  return Math.sqrt(
    (24 * len * Math.pow(len - 1, 2)) /
      ((len - 3) * (len - 2) * (len + 3) * (len + 5))
  );
}

// export function skewnessDeviation1(len: number) {
//   return Math.sqrt((6 * (len - 2)) / ((len + 1) * (len + 3)));
// }

// export function kurtosisDeviation1(len: number) {
//   return Math.sqrt(
//     (24 * len * (len - 2) * (len - 3)) /
//       (Math.pow(len + 1, 2) * (len + 3) * (len + 5))
//   );
// }
