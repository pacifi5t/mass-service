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
    return new Config(5, 0, 10, 2);
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
