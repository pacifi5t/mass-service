export function modelExpRandomValue(a: number) {
  return (-1 / a) * Math.log(1 - Math.random()); 
}

export function modelWeibullRandomValue(a: number, b: number) {
  return Math.pow(-a * Math.log(1 - Math.random()), 1 / b)
}
