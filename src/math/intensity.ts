import * as d3 from "d3";
import * as math from "../math";

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

    const intensities: Intensity[] = math.streamIntesities(
      tauArr.length,
      classes,
      classifiedTau,
      classWidth
    );

    const intervals = [];
    for (let i = 0; i < classes - 1; i++) {
      intervals.push(
        math.intensityConfInterval(
          intensities[i].value,
          classifiedTau[i].length
        )
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
}
