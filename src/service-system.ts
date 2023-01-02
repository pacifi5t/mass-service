import { range } from "d3";
import { round } from "./math";

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
  const idleTimeArr = genIdleTimeArr(res, analysisTimeArr);
  for (let i = 0; i < analysisTimeArr.length; i++) {
    const time = analysisTimeArr[i];
    const ops = res.ops.filter((e) => e.startTime < time);
    const demandsPushed = demands.filter((e) => e.pushTime < time).length;
    const queue = queueStateAtTime(time, res);

    const serviced = res.ops.filter((e) => e.finishTime < time).length;
    const idleTime = idleTimeArr[i];
    const idleProb = idleTime / time;

    const isLoaded = res.ops.filter(
      (e) => e.startTime < time && e.finishTime > time
    ).length;
    const inSystem = queue.length + Number(isLoaded);

    const notServiced = demandsPushed - serviced - inSystem;
    const { avgQueue, avgService, avgSystem } = calcAverages(ops);

    items.push({
      time,
      idleTime: round(idleTime),
      loadedTime: round(time - idleTime),
      idleP: round(idleProb),
      loadedP: round(1 - idleProb),
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

//TODO: Need to be remade :(
function genIdleTimeArr(res: ModelResults, analysisTimeArr: number[]) {
  const tempArr: number[] = [];

  // Calc idleArr for each operation
  for (let i = 0; i < res.ops.length; i++) {
    const prev = res.ops[i - 1];
    const prevFinish = prev === undefined ? 0 : prev.finishTime;
    tempArr.push(res.ops[i].startTime - prevFinish);
  }

  // Calc idleArr for each analysis time
  const idleTimeArr: number[] = [];
  for (let i = 0; i < analysisTimeArr.length; i++) {
    const time = analysisTimeArr[i];
    const ops = res.ops.filter((e) => e.startTime < time);

    const idleTime = tempArr
      .slice(0, ops.length)
      .reduce((total, e) => total + e, 0);
    idleTimeArr.push(ops.length == 0 ? time : idleTime);
  }

  // Add idle time after last operation
  let indexNoOps: number;
  const lastOpFinishTime = res.ops[res.ops.length - 1].finishTime;
  for (let i = 0; i < analysisTimeArr.length; i++) {
    const time = analysisTimeArr[i];
    if (time < lastOpFinishTime) {
      continue;
    }

    idleTimeArr[i] += time - lastOpFinishTime;
    indexNoOps = i + 1;
    break;
  }

  for (let i = indexNoOps; i < analysisTimeArr.length; i++) {
    const time = analysisTimeArr[i];
    const prevTime = analysisTimeArr[i - 1];
    idleTimeArr[i] = idleTimeArr[i - 1] + (time - prevTime);
  }

  return idleTimeArr;
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
