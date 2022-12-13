import { pearsonDistribQuan, normQuan, alpha } from ".";

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

export function streamIntesities(
  len: number,
  classes: number,
  classifiedTau: number[][],
  width: number
) {
  const streamIntesities = [];
  for (let i = 0; i < classes - 1; i++) {
    const temp = classifiedTau
      .slice(0, i)
      .reduce((total, e) => total + e.length, 0);
    streamIntesities.push(classifiedTau[i].length / ((len - temp) * width));
  }
  return streamIntesities;
}

export function intensityConfInterval(intensity: number, classSize: number) {
  const a = 2 * classSize;
  const hi1 = pearsonDistribQuan(1 - alpha / 2, a);
  const hi2 = pearsonDistribQuan(alpha / 2, a);

  // maybe should be in reverse order???
  return [(intensity * hi2) / a, (intensity * hi1) / a];
}
