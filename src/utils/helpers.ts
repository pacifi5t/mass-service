export function pretty(num: number): number {
  return toPrecision(num, 2);
}

export function toPrecision(num: number, precision: number): number {
  if (num == undefined) {
    return NaN;
  }

  const numStr = num.toString();
  let passedDot = false;

  let counter = 0;
  for (; counter < numStr.length; counter++) {
    const char = numStr[counter];

    if (char === ".") {
      passedDot = true;
    } else if (passedDot && char !== "0") {
      return parseFloat(numStr.slice(0, counter + precision));
    }
  }

  return num;
}
