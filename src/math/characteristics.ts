export function mean(array: number[]) {
  return array.reduce((total, x) => total + x) / array.length;
}

export function stdDev(array: number[], mean: number) {
  return Math.sqrt(
    array.reduce((total, x) => total + Math.pow(x - mean, 2), 0) /
      (array.length - 1)
  );
}

export function median(array: number[]) {
  const sorted = [...array].sort((a, b) => a - b);
  return sorted.length % 2 != 0
    ? sorted[Math.round((sorted.length + 1) / 2)]
    : (sorted[sorted.length / 2] + sorted[sorted.length / 2 + 1]) / 2;
}

export function skewnessCoef(
  array: number[],
  shiftedStdDev: number,
  mean: number
) {
  return (
    (Math.sqrt(array.length * (array.length - 1)) / (array.length - 2)) *
    skewnessCoef1(array, shiftedStdDev, mean)
  );
}

export function kurtosisCoef(
  array: number[],
  shiftedStdDev: number,
  mean: number
) {
  return (
    ((array.length * array.length - 1) /
      ((array.length - 2) * (array.length - 3))) *
    (kurtosisCoef1(array, shiftedStdDev, mean) + 6 / (array.length + 1))
  );
}

export function antikurtosisCoef(kurtosisCoef1: number) {
  return 1 / Math.sqrt(kurtosisCoef1 + 3);
}

export function kurtosisCoef1(
  array: number[],
  shiftedStdDev: number,
  mean: number
) {
  return (
    array.reduce((total, x) => total + Math.pow(x - mean, 4), 0) /
      (array.length * Math.pow(shiftedStdDev, 4)) -
    3
  );
}

function skewnessCoef1(array: number[], shiftedStdDev: number, mean: number) {
  return (
    array.reduce((total, x) => total + Math.pow(x - mean, 3), 0) /
    (array.length * Math.pow(shiftedStdDev, 3))
  );
}
