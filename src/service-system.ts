import { round } from "./math";

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
    this.pushTime = round(pushTime);
    this.serviceTime = round(serviceTime);
  }
}

export class Operation {
  id: number;
  startTime: number;
  finishTime: number;
  queueAwaitTime: number;

  constructor(id: number, start: number, finish: number, queueAwait: number) {
    this.id = id;
    this.startTime = round(start);
    this.finishTime = round(finish);
    this.queueAwaitTime = round(queueAwait);
  }
}

export class QueuedOp {
  pushTime: number;
  startTime: number;
  finishTime: number;

  constructor(push: number, start: number, finish: number) {
    this.pushTime = round(push);
    this.startTime = round(start);
    this.finishTime = round(finish);
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
    const finishTime = prevFinishTime + serviceTime;

    // Refuse to service because can't complete in time
    if (finishTime > config.uptime) {
      queueStates.push(new QueueState(time, queue));
      continue;
    }

    // Service immediately, worker is idle
    if (prevFinishTime <= time) {
      ops.push(new Operation(i, time, time + serviceTime, 0));
      queueStates.push(new QueueState(time, queue));
      continue;
    }

    // Add demand to queue
    if (queue.length < config.maxQueueLength) {
      const queueAwaitTime = prevFinishTime - time;
      queue.push(new QueuedOp(time, prevFinishTime, finishTime));
      ops.push(new Operation(i, prevFinishTime, finishTime, queueAwaitTime));
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
