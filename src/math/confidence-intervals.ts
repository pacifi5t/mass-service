import { normDistribQuan, studentDistribQuan } from ".";

export const alpha = 0.05;

export function meanConfInterval(
  len: number,
  meanStdDev: number,
  mean: number
) {
  const q = studentDistribQuan(1 - alpha / 2, len);
  return [mean - q * meanStdDev, mean + q * meanStdDev];
}

export function medianConfInterval(array: number[]) {
  const len = array.length;
  const sorted = [...array].sort((a, b) => a - b);
  const q = normDistribQuan(1 - alpha / 2);
  return [
    sorted[Math.round(len / 2 - (q * Math.sqrt(len)) / 2)],
    sorted[Math.round(len / 2 + 1 + (q * Math.sqrt(len)) / 2)] ??
      sorted[len - 1]
  ];
}

export function stdDevConfInterval(
  len: number,
  stdDev: number,
  stdDevDeviation: number
) {
  const q = studentDistribQuan(1 - alpha / 2, len);
  return [stdDev - q * stdDevDeviation, stdDev + q * stdDevDeviation];
}

export function coefConfInterval(
  len: number,
  coefficient: number,
  coefStdDev: number
) {
  const q = studentDistribQuan(1 - alpha / 2, len);
  return [coefficient - q * coefStdDev, coefficient + q * coefStdDev];
}
