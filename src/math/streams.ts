import { range } from "d3";
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
      .slice(0, i + 1)
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

export function approxP1(
  intensities: number[],
  classWidth: number,
  tauMin: number
) {
  const sum1 = intensities.reduce((total, e) => total + Math.log(e), 0);
  const sum2 = intensities.reduce(
    (total, _, i) => total + Math.pow(t(i + 1, classWidth, tauMin), 2),
    0
  );
  const sum3 = intensities.reduce(
    (total, e, i) => total + Math.log(e) * t(i + 1, classWidth, tauMin),
    0
  );
  const sum4 = intensities.reduce(
    (total, _, i) => total + t(i + 1, classWidth, tauMin),
    0
  );
  const denom = denominator(intensities.length + 1, classWidth, tauMin);
  return (sum1 * sum2 - sum3 * sum4) / denom;
}

export function approxP2(
  intensities: number[],
  classWidth: number,
  tauMin: number
) {
  const sum1 = intensities.reduce(
    (total, e, i) => total + Math.log(e) * t(i + 1, classWidth, tauMin),
    0
  );
  const sum2 = intensities.reduce(
    (total, _, i) => total + t(i + 1, classWidth, tauMin),
    0
  );
  const sum3 = intensities.reduce((total, e) => total + Math.log(e), 0);
  const denom = denominator(intensities.length + 1, classWidth, tauMin);
  return (intensities.length * sum1 - sum2 * sum3) / denom;
}

function denominator(classes: number, classWidth: number, tauMin: number) {
  const r = range(1, classes);

  const sum1 = r.reduce(
    (total, e) => total + Math.pow(t(e, classWidth, tauMin), 2),
    0
  );
  const sum2 = Math.pow(
    r.reduce((total, e) => total + t(e, classWidth, tauMin), 0),
    2
  );

  return (classes - 1) * sum1 - sum2;
}

export function t(s: number, classWidth: number, tauMin: number) {
  return tauMin + (s - 0.5) * classWidth;
}

export function approxIntensity(t: number, a: number, b: number) {
  const e = Math.E;
  return 1 - Math.pow(e, Math.pow(e, a) * (1 - Math.pow(e, b * t)));
}

export function intensityFn(t: number, a: number, b: number) {
  return Math.pow(Math.E, a + b * t);
}
