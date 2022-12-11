class Series {
  data: number[];
  count: Map<number, number>;
  frequency: Map<number, number>;
  empDistrFunc: Map<number, number>;

  constructor() {
    this.data = [];
    this.count = new Map();
    this.frequency = new Map();
    this.empDistrFunc = new Map();
  }
}

export class VarSeries extends Series {
  readonly initialArray: number[];
  length: number;

  constructor(array?: number[]) {
    super();

    if (typeof array === "undefined") {
      this.length = 0;
      this.initialArray = [];
      return;
    }

    this.length = array.length;
    this.initialArray = [...array];
    array
      .sort((a, b) => a - b)
      .forEach((elem) => {
        const index = this.data.indexOf(elem);
        if (index === -1) {
          this.count.set(this.data.length, 1);
          this.data.push(elem);
        } else {
          this.count.set(index, this.count.get(index) + 1);
        }
      });

    this.data.forEach((_elem, index) =>
      this.frequency.set(index, this.count.get(index) / this.length)
    );
    this.data.forEach((_elem, index) => {
      if (index == 0) {
        this.empDistrFunc.set(index, this.frequency.get(index));
      } else {
        this.empDistrFunc.set(
          index,
          this.empDistrFunc.get(index - 1) + this.frequency.get(index)
        );
      }
    });
    this.empDistrFunc.set(this.data.length - 1, 1);
  }
}

export class ClassifiedSeries extends Series {
  readonly initialArray: number[];
  classCount: number;
  limits: number[];

  constructor(classCount?: number, limits?: number[], array?: number[]) {
    super();

    if (
      typeof classCount === "undefined" ||
      typeof limits === "undefined" ||
      typeof array === "undefined"
    ) {
      this.classCount = 0;
      this.limits = [];
      this.initialArray = [];
      return;
    } else {
      this.initialArray = [...array];
      this.classCount = classCount;
      this.limits = limits;
    }

    for (let i = 0; i < classCount; i++) {
      this.data.push(i + 1);
      this.count.set(i, 0);
    }

    array.forEach((elem) => {
      const index = this.data.indexOf(elem);
      this.count.set(index, this.count.get(index) + 1);
    });

    this.data.forEach((_elem, index) =>
      this.frequency.set(index, this.count.get(index) / array.length)
    );
    this.data.forEach((_elem, index) => {
      if (index == 0) {
        this.empDistrFunc.set(index, this.frequency.get(index));
      } else {
        this.empDistrFunc.set(
          index,
          this.empDistrFunc.get(index - 1) + this.frequency.get(index)
        );
      }
    });
    this.empDistrFunc.set(this.data.length - 1, 1);
  }
}
