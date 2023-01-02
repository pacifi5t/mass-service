<script lang="ts">
  import { Table } from "attractions";
  import * as sys from "../service-system";
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

  const res = sys.modelOneChannel(config, demands);

  console.clear();
  console.table(demands);
  console.table(res.ops);
  console.log(res);

  analyze(demands, res, sys.genAnalysisTimeArr(config));

  function analyze(
    demands: sys.Demand[],
    res: sys.ModelResults,
    analysisTimeArr: number[]
  ) {
    const idleTimeArr = sys.genIdleTimeArr(res, analysisTimeArr);
    for (let i = 0; i < analysisTimeArr.length; i++) {
      const time = analysisTimeArr[i];
      const ops = res.ops.filter((e) => e.startTime < time);
      const demandsPushed = demands.filter((e) => e.pushTime < time).length;
      const queue = sys.queueStateAtTime(time, res);

      const serviced = res.ops.filter((e) => e.finishTime < time).length;
      const idleTime = idleTimeArr[i];
      const idleProb = idleTime / time;

      const isLoaded = res.ops.filter(
        (e) => e.startTime < time && e.finishTime > time
      ).length;
      const inSystem = queue.length + Number(isLoaded);

      const notServiced = demandsPushed - serviced - inSystem;
      const { avgQueue, avgService, avgSystem } = sys.calcAverages(ops);

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
  }
</script>

<Table {headers} {items} />
