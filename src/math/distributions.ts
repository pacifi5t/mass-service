import seedrandom from "seedrandom";

const rng = seedrandom("42");

export function modelExpRandomValue(a: number) {
  return (-1 / a) * Math.log(1 - rng()); 
}

export function modelWeibullRandomValue(a: number, b: number) {
  return Math.pow(-a * Math.log(1 - rng()), 1 / b)
}
