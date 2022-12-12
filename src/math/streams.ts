import { normQuan } from "./parameters";

export function streamStat(width: number, classSize: number, len: number) {
  return classSize / (len * width);
}

export function streamStatConfInterval(
  stat: number,
  width: number,
  classSize: number,
  len: number
): [number, number] {
  const a = Math.pow(normQuan, 2) / 2;
  const b = normQuan * Math.sqrt(classSize + a / 2);
  return [stat + (a - b) / (len * width), stat + (a + b) / (len * width)];
}
