export class Config {
  maxQueueLength: number;
  initialDemands: number;
  uptime: number;
  analysisPeriod: number;

  constructor(
    maxQueueLength: number,
    initialDemands: number,
    uptime: number,
    analysisPeriod: number
  ) {
    this.maxQueueLength = maxQueueLength;
    this.initialDemands = initialDemands;
    this.uptime = uptime;
    this.analysisPeriod = analysisPeriod;
  }

  public static default(): Config {
    return new Config(5, 0, 20, 2);
  }
}

export class Demand {
  delay: number;
  serviceTime: number;

  constructor(delay: number, serviceTime: number) {
    this.delay = delay;
    this.serviceTime = serviceTime;
  }
}

export class Operation {
  startTime: number;
  finishTime: number;
  queueAwaitTime: number;

  constructor(start: number, finish: number, queueAwait: number) {
    this.startTime = start;
    this.finishTime = finish;
    this.queueAwaitTime = queueAwait;
  }
}

export class QueuedOp {
  pushTime: number;
  startTime: number;
  finishTime: number;

  constructor(push: number, start: number, finish: number) {
    this.pushTime = push;
    this.startTime = start;
    this.finishTime = finish;
  }
}
