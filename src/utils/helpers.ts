export function pretty(num: number): number {
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
