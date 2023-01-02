<script lang="ts">
  import { Table } from "attractions";
  import { range } from "d3";
  import {
    modelOneChannel,
    ModelResults,
    Demand,
    Operation
  } from "../service-system";
  import { demandsStore, demandsCountStore, configStore } from "../stores";
  import { round } from "../math";

  const items = [];
  const headers = [
    { text: "time", value: "time" },
    { text: "idle time", value: "idleTime" },
    { text: "load time", value: "loadedTime" },
    { text: "idle prob", value: "idleP" },
    { text: "load prob", value: "loadedP" },
    { text: "serviced", value: "serviced" },
    { text: "not serviced", value: "notServiced" },
    { text: "in system", value: "inSystem" },
    { text: "avg in queue", value: "avgQueue" },
    { text: "avg in service", value: "avgService" },
    { text: "avg in system", value: "avgSystem" }
  ];

  const config = $configStore;
  const demands = $demandsStore
    .slice(0, $demandsCountStore)
    .filter((e) => e.pushTime < config.uptime);

  const res = modelOneChannel(config, demands);
  console.table(demands);
  console.table(res.ops);
  console.log(res);

  analyze(demands, res, genAnalysisTimeArr());

  function analyze(
    demands: Demand[],
    res: ModelResults,
    analysisTimeArr: number[]
  ) {
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
      const isLast = i == analysisTimeArr.length - 1;

      items.push({
        time: time,
        idleTime: round(idleTime),
        loadedTime: round(time - idleTime),
        idleP: round(idleProb),
        loadedP: round(1 - idleProb),
        serviced,
        notServiced: isLast ? notServiced + inSystem : notServiced,
        inSystem: isLast ? 0 : inSystem,
        avgSystem: round(avgSystem),
        avgQueue: round(avgQueue),
        avgService: round(avgService)
      });
    }
  }

  function genIdleTimeArr(res: ModelResults, analysisTimeArr: number[]) {
    const tempArr: number[] = [];

    // Calc idleArr for each operation
    for (let i = 0; i < res.ops.length; i++) {
      const prev = res.ops[i - 1];
      const prevFinish = prev == undefined ? 0 : prev.finishTime;
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
    return idleTimeArr;
  }

  function genAnalysisTimeArr() {
    const count = Math.ceil(config.uptime / config.analysisPeriod);
    const analysisTimes = range(count).map(
      (e) => (e + 1) * config.analysisPeriod
    );
    analysisTimes.splice(count - 1, 1);
    analysisTimes.push(config.uptime);
    return analysisTimes;
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
    let queue = res.queueStates[0].queue;
    for (let j = 1; j < res.queueStates.length; j++) {
      const temp = res.queueStates[j];
      if (temp.time > time) {
        const q = res.queueStates[j - 1];
        queue = q.queue.filter((e) => e.startTime >= time);
        break;
      }
    }
    return queue;
  }
</script>

<Table {headers} {items} />
