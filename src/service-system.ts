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
    return new Config(3, 0, 20, 2);
  }
}

export class Demand {
  pushTime: number;
  serviceTime: number;

  constructor(pushTime: number, serviceTime: number) {
    this.pushTime = pushTime;
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

export class ModelResults {
  ops: Operation[];
  queueStates: QueueState[];

  constructor(ops: Operation[], queueStates: QueueState[]) {
    this.ops = ops;
    this.queueStates = queueStates;
  }
}

export function modelOneChannel(config: Config, demands: Demand[]) {
  const queueStates: QueueState[] = [];
  let queue: QueuedOp[] = [];
  const ops: Operation[] = [];

  for (let i = 0; i < demands.length; i++) {
    const time = demands[i].pushTime;
    const serviceTime = demands[i].serviceTime;

    queue = queue.filter((e) => e.startTime >= time);
    const prevFinishTime = i == 0 ? 0 : getPrevFinishTime(queue, ops);

    // Add demand to queue or service it
    if (prevFinishTime > time) {
      if (queue.length < config.maxQueueLength) {
        const finishTime = prevFinishTime + serviceTime;
        const queueAwaitTime = prevFinishTime - time;
        queue.push(new QueuedOp(time, prevFinishTime, finishTime));
        ops.push(new Operation(prevFinishTime, finishTime, queueAwaitTime));
      }
    } else {
      ops.push(new Operation(time, time + serviceTime, 0));
    }

    queueStates.push(new QueueState(time, queue));
  }
  return new ModelResults(ops, queueStates);
}

function getPrevFinishTime(queue: QueuedOp[], ops: Operation[]) {
  if (queue.length !== 0) {
    return queue[queue.length - 1].finishTime;
  }
  return ops[ops.length - 1]?.finishTime;
}
