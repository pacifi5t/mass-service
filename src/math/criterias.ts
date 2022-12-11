import { alpha, fisherDistribQuan, mean, normDistribQuan, stdDev } from ".";

const myEpsilon = 1 / Math.pow(10, 6);

export function depMeanEq(arrX: number[], arrY: number[]): [boolean, number] {
  const arrZ = [];
  for (let i = 0; i < arrX.length; i++) {
    arrZ.push(arrX[i] - arrY[i] ?? arrX[i]);
  }
  const zMean = mean(arrZ);
  const zStd = stdDev(arrZ, zMean);
  const t = (zMean * Math.sqrt(arrZ.length)) / zStd;

  return [Math.abs(t) <= normDistribQuan(1 - alpha / 2), t];
}

export function indepMeanEq(
  arrX: number[],
  arrY: number[],
  welch: boolean
): [boolean, number] {
  const xMean = mean(arrX);
  const yMean = mean(arrY);
  const xDev = stdDev(arrX, xMean);
  const yDev = stdDev(arrY, yMean);

  if (welch) {
    const v =
      Math.pow(
        Math.pow(xDev, 2) / arrX.length + Math.pow(yDev, 2) / arrY.length,
        2
      ) /
      (Math.pow(Math.pow(xDev, 2) / arrX.length, 2) / (arrX.length - 1) +
        Math.pow(Math.pow(yDev, 2) / arrY.length, 2) / (arrY.length - 1));
    const t =
      (xMean - yMean) /
      Math.sqrt(
        Math.pow(xDev, 2) / arrX.length + Math.pow(yDev, 2) / arrY.length
      );
    return [Math.abs(t) <= normDistribQuan(1 - alpha / 2), t];
  } else {
    const v = arrX.length + arrY.length - 2;
    const dispersion =
      ((arrX.length - 1) * Math.pow(xDev, 2) +
        (arrY.length - 1) * Math.pow(yDev, 2)) /
      v;
    const t =
      (xMean - yMean) /
      Math.sqrt(dispersion / arrX.length + dispersion / arrY.length);
    return [Math.abs(t) <= normDistribQuan(1 - alpha / 2), t];
  }
}

export function dispersionEq(
  arrX: number[],
  arrY: number[]
): [boolean, number] {
  const f =
    Math.pow(stdDev(arrX, mean(arrX)), 2) /
    Math.pow(stdDev(arrY, mean(arrY)), 2);
  const v1 = arrX.length - 1;
  const v2 = arrY.length - 1;
  const f1 = fisherDistribQuan(alpha / 2, v1, v2);
  const f2 = fisherDistribQuan(1 - alpha / 2, v1, v2);

  return [f1 <= f && f <= f2, f];
}

export function testMannWhitney(
  arrX: number[],
  arrY: number[]
): [boolean, number] {
  let V = 0;
  for (let i = 0; i < arrX.length; i++) {
    const x = arrX[i];
    for (let j = 0; j < arrY.length; j++) {
      const y = arrY[j];
      if (x > y) {
        V += 1;
      } else if (x + myEpsilon > y && x - myEpsilon < y) {
        V += 0.5;
      }
    }
  }

  const E = (arrX.length * arrY.length) / 2;
  const D = (E / 6) * (arrX.length + arrY.length + 1);
  const u = (V - E) / Math.sqrt(D);
  return [Math.abs(u) <= normDistribQuan(1 - alpha / 2), u];
}

export function testWilcoxonSignedRank(
  arrX: number[],
  arrY: number[]
): [boolean, number] {
  let arrZ = [];
  for (let i = 0; i < arrX.length; i++) {
    arrZ.push(arrX[i] - arrY[i]);
  }
  arrZ = arrZ.filter((elem) => elem != 0);

  const arrS = [];
  for (let i = 0; i < arrZ.length; i++) {
    arrS.push(arrZ[i] > 0 ? 1 : 0);
  }

  const ranks = new Map<number, number>();
  const duplicates = new Map<number, Array<number>>();
  const sorted = [...arrZ]
    .map((value) => Math.abs(value))
    .sort((a, b) => a - b);

  sorted.forEach((elem, index) => {
    if (sorted.indexOf(elem) !== index) {
      if (duplicates.has(elem)) {
        duplicates.set(elem, [...duplicates.get(elem), index + 1]);
      } else {
        duplicates.set(elem, [index + 1]);
      }
    }
  });

  for (let i = 0; i < sorted.length; i++) {
    const elem = sorted[i];
    if (duplicates.has(elem)) {
      ranks.set(
        elem,
        duplicates
          .get(elem)
          .reduce((total: number, x: number) => total + x, 0) /
          duplicates.get(elem).length
      );
    } else {
      ranks.set(elem, i + 1);
    }
  }

  let T = 0;
  for (let i = 0; i < arrS.length; i++) {
    T += arrS[i] * ranks.get(Math.abs(arrZ[i]));
  }

  const E = (arrS.length * (arrS.length + 1)) / 4;
  const D = (E * (2 * arrS.length + 1)) / 6;
  const u = (T - E) / Math.sqrt(D);
  return [Math.abs(u) <= normDistribQuan(1 - alpha / 2), u];
}
