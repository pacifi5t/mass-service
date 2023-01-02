import { range } from "d3";
import { round, clamp } from "./math";

export type AnalysisItem = {
  time: number;
  idleTime: number;
  loadedTime: number;
  idleP: number;
  loadedP: number;
  serviced: number;
  notServiced: number;
  inSystem: number;
  avgSystem: number;
  avgQueue: number;
  avgService: number;
};

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

export function analyze(
  demands: Demand[],
  res: ModelResults,
  analysisTimeArr: number[]
) {
  const items: AnalysisItem[] = [];
  const loadTimeArr = calcLoadTimeArr(res, analysisTimeArr);

  for (let i = 0; i < analysisTimeArr.length; i++) {
    const time = analysisTimeArr[i];
    const ops = res.ops.filter((e) => e.startTime < time);
    const demandsPushed = demands.filter((e) => e.pushTime < time).length;
    const queue = queueStateAtTime(time, res);

    const serviced = res.ops.filter((e) => e.finishTime < time).length;
    const loadedTime = round(
      loadTimeArr.slice(0, i + 1).reduce((total, e) => total + e, 0)
    );
    const loadedP = round(loadedTime / time);

    const isLoaded = res.ops.filter(
      (e) => e.startTime < time && e.finishTime > time
    ).length;
    const inSystem = queue.length + Number(isLoaded);

    const notServiced = demandsPushed - serviced - inSystem;
    const { avgQueue, avgService, avgSystem } = calcAverages(ops);

    items.push({
      time,
      idleTime: round(time - loadedTime),
      loadedTime,
      idleP: round(1 - loadedP),
      loadedP,
      serviced,
      notServiced,
      inSystem,
      avgSystem: round(avgSystem),
      avgQueue: round(avgQueue),
      avgService: round(avgService)
    });
  }
  return items;
}

function calcAverages(ops: Operation[]) {
  const n = ops.length;
  const avgQueue =
    ops.map((e) => e.queueAwaitTime).reduce((s, e) => s + e, 0) / n;
  const avgService =
    ops.map((e) => e.finishTime - e.startTime).reduce((s, e) => s + e, 0) / n;
  const avgSystem =
    ops
      .map((e) => e.queueAwaitTime + (e.finishTime - e.startTime))
      .reduce((s, e) => s + e, 0) / n;
  return { avgQueue, avgService, avgSystem };
}

function queueStateAtTime(time: number, res: ModelResults) {
  const len = res.queueStates.length;
  for (let j = 1; j < len; j++) {
    if (res.queueStates[j].time > time) {
      const q = res.queueStates[j - 1];
      return q.queue.filter((e) => e.startTime >= time);
    }
  }
  return res.queueStates[len - 1].queue.filter((e) => e.startTime >= time);
}

export function genAnalysisTimeArr(config: Config) {
  const count = Math.ceil(config.uptime / config.analysisPeriod);
  const analysisTimes = range(count).map(
    (e) => (e + 1) * config.analysisPeriod
  );
  analysisTimes.splice(count - 1, 1);
  analysisTimes.push(config.uptime);
  return analysisTimes;
}

function calcLoadTimeArr(res: ModelResults, analysisTimeArr: number[]) {
  const loadTimeArr: number[] = [];
  for (let i = 0; i < analysisTimeArr.length; i++) {
    let loadTime = 0;
    const tCurrent = analysisTimeArr[i];
    const tPrev =
      analysisTimeArr[i - 1] === undefined ? 0 : analysisTimeArr[i - 1];

    for (let j = 0; j < res.ops.length; j++) {
      const op = res.ops[j];
      if (!operationOverlapsTimeRange(op, tPrev, tCurrent)) {
        continue;
      }
      loadTime +=
        clamp(op.finishTime, tPrev, tCurrent) -
        clamp(op.startTime, tPrev, tCurrent);
    }
    loadTimeArr.push(loadTime);
  }
  return loadTimeArr;
}

function operationOverlapsTimeRange(
  op: Operation,
  tPrev: number,
  tCurrent: number
) {
  return (
    (op.startTime > tPrev && op.finishTime < tCurrent) ||
    (op.startTime < tPrev && op.finishTime > tPrev) ||
    (op.startTime < tCurrent && op.finishTime > tCurrent)
  );
}
