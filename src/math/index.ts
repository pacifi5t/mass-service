export * from "./characteristics";
export * from "./confidence-intervals";
export * from "./criterias";
export * from "./deviations";
export * from "./quantiles";
export * from "./parameters";
export * from "./streams";
export * from "./intensity";
export * from "./distributions";

export function round(num: number): number {
  return roundTo(num, 4);
}

export function roundTo(num: number, digits: number) {
  if (digits === undefined) {
    digits = 0;
  }

  const multiplicator = Math.pow(10, digits);
  num = parseFloat((num * multiplicator).toFixed(11));
  return Math.round(num) / multiplicator;
}

export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}
