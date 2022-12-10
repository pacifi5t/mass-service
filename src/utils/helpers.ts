export function pretty(num: number): number {
  return prettyToPrecision(num, 3);
}

export function prettyToPrecision(num: number, precision: number): number {
  if (num == undefined) {
    return NaN;
  }
  return parseFloat(num.toPrecision(precision));
}
