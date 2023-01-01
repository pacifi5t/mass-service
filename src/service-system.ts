import { range } from "d3";

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

export class QueueState {
  time: number;
  queue: QueuedOp[];

  constructor(time: number, queue: QueuedOp[]) {
    this.time = time;
    this.queue = [...queue];
  }
}

export class Results {
  ops: Operation[];
  queueStates: QueueState[];
  idleTimeArr: number[];
  notServiced: number;

  constructor(
    ops: Operation[],
    queueStates: QueueState[],
    idleTimeArr: number[],
    notServiced: number
  ) {
    this.ops = ops;
    this.queueStates = queueStates;
    this.idleTimeArr = idleTimeArr;
    this.notServiced = notServiced;
  }
}

export function modelOneChannel(
  config: Config,
  demands: Demand[],
  pushTimeArr: number[]
) {
  const queueStates: QueueState[] = [];
  const queue: QueuedOp[] = [];
  const ops: Operation[] = [];
  const idleTimeArr = range(demands.length).map(() => 0);
  let notServiced = 0;

  for (let i = 0; i < pushTimeArr.length; i++) {
    const time = pushTimeArr[i];
    const serviceTime = demands[i].serviceTime;

    if (config.uptime < time) {
      notServiced += demands.length - i;
      queueStates.push(new QueueState(time, queue));
      break;
    }

    // Clear the queue from already started or serviced demands
    for (let j = 0; j < queue.length; j++) {
      if (queue[j].startTime < time) {
        queue.splice(j, 1);
      }
    }

    // Get the finish time of previous demand
    let prevFinishTime = 0;
    if (queue.length !== 0) {
      prevFinishTime = queue[queue.length - 1].finishTime;
    } else {
      const t = ops[i - 1]?.finishTime;
      if (t !== undefined) {
        prevFinishTime = t;
      }
    }

    // Add demand to queue or service it
    if (prevFinishTime > time) {
      if (queue.length >= config.maxQueueLength) {
        notServiced += 1;
      } else {
        const finishTime = prevFinishTime + serviceTime;
        const queueAwaitTime = prevFinishTime - time;
        queue.push(new QueuedOp(time, prevFinishTime, finishTime));
        ops.push(new Operation(prevFinishTime, finishTime, queueAwaitTime));
      }
    } else {
      ops.push(new Operation(time, time + serviceTime, 0));
      idleTimeArr[i] = time - prevFinishTime;
    }

    queueStates.push(new QueueState(time, queue));
  }
  return new Results(ops, queueStates, idleTimeArr, notServiced);
}
