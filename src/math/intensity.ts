import * as d3 from "d3";
import {
  alpha,
  intensityConfInterval,
  streamIntesities,
  studentDistribQuan,
  tStat
} from ".";

export class ClassifiedTau {
  classWidth: number;
  taus: number[][];
  intensities: Intensity[];
  intenConfIntervals: [number, number][];

  constructor(
    cw: number,
    t: number[][],
    i: Intensity[],
    icf: [number, number][]
  ) {
    this.classWidth = cw;
    this.taus = t;
    this.intensities = i;
    this.intenConfIntervals = icf;
  }

  public static fromTauArr(tauArr: number[], classes: number) {
    const min = d3.min(tauArr);
    const max = d3.max(tauArr);
    const classWidth = (max - min) / classes;

    const classifiedTau: number[][] = [];
    for (let i = 0; i < classes; i++) {
      classifiedTau.push([]);
    }

    for (let i = 0; i < tauArr.length; i++) {
      const elem = tauArr[i];
      for (let j = 1; j <= classes; j++) {
        const classLim = min + j * classWidth;
        if (classLim >= elem) {
          classifiedTau[j - 1].push(elem);
          break;
        }
      }
    }

    const intensities: Intensity[] = streamIntesities(
      tauArr.length,
      classes,
      classifiedTau,
      classWidth
    );

    const intervals = [];
    for (let i = 0; i < classes - 1; i++) {
      intervals.push(
        intensityConfInterval(intensities[i].value, classifiedTau[i].length)
      );
    }

    return new ClassifiedTau(classWidth, classifiedTau, intensities, intervals);
  }

  public min() {
    return d3.min(this.taus.flat());
  }

  public max() {
    return d3.max(this.taus.flat());
  }

  public classCount() {
    return this.taus.length;
  }
}

export class Intensity {
  value: number;
  classSize: number;

  constructor(value: number, classSize: number) {
    this.value = value;
    this.classSize = classSize;
  }

  public canBeMergedWith(other: Intensity) {
    const stat = Math.abs(tStat(this, other));
    const quan = studentDistribQuan(
      1 - alpha / 2,
      this.classSize + other.classSize - 2
    );
    return stat <= quan;
  }

  public mergeWith(other: Intensity) {
    return new Intensity(
      (this.value * this.classSize + other.value * other.classSize) /
        (this.classSize + other.classSize),
      this.classSize + other.classSize
    );
  }
}

export class SignificantIntensities {
  intensities: Intensity[];
  limits: number[];

  constructor(i: Intensity[], l: number[]) {
    this.intensities = i;
    this.limits = l;
  }

  public static fromClassifiedTau(classified: ClassifiedTau) {
    const intensities = classified.intensities;
    const significantIntesities = [];
    const mergedClasses: number[][] = [[]];

    let temp: Intensity = undefined;
    for (let i = 0; i < intensities.length; i++) {
      const elem = intensities[i];

      if (temp === undefined) {
        const elem2 = intensities[i + 1];
        if (elem2 === undefined) {
          significantIntesities.push(elem);
          mergedClasses.push([i]);
          break;
        }

        if (elem.canBeMergedWith(elem2)) {
          temp = elem.mergeWith(elem2);
          mergedClasses[mergedClasses.length - 1].push(i);
          mergedClasses[mergedClasses.length - 1].push(i + 1);
          i++;
        } else {
          significantIntesities.push(elem);
          mergedClasses[mergedClasses.length - 1].push(i);
          mergedClasses.push([]);
        }
      } else {
        if (elem.canBeMergedWith(temp)) {
          temp = temp.mergeWith(elem);
          mergedClasses[mergedClasses.length - 1].push(i);
        } else {
          significantIntesities.push(temp);
          temp = undefined;
          mergedClasses.push([]);
          i--;
        }
      }
    }

    if (temp !== undefined) {
      significantIntesities.push(temp);
    }

    console.log(significantIntesities);
    console.log(mergedClasses);

    return new SignificantIntensities(
      significantIntesities,
      this.calcClassLimits(classified, mergedClasses)
    );
  }

  static calcClassLimits(classified: ClassifiedTau, mergedClasses: number[][]) {
    const minTau = classified.min();
    return mergedClasses.map(
      (e) => minTau + (e[e.length - 1] + 1) * classified.classWidth
    );
  }
}
