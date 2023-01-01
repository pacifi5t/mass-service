<script lang="ts">
  import { Table } from "attractions";
  import { range } from "d3";
  import { Operation, QueuedOp, modelOneChannel } from "../service-system";
  import { demandsStore, demandsCountStore, configStore } from "../stores";

  const items = [];
  const headers = [
    { text: "idle time", value: "it" },
    { text: "idle prob", value: "ip" },
    { text: "load time", value: "lt" },
    { text: "load prob", value: "lp" },
    { text: "serviced", value: "s" },
    { text: "not serviced", value: "u" },
    { text: "demands in system", value: "d" },
    { text: "avg time in system", value: "a" }
  ];

  const config = $configStore;
  const demands = $demandsStore.slice(0, $demandsCountStore);

  const res = modelOneChannel(config, demands);
  console.table(demands);
  console.table(res.ops);
  console.log(res);

  //TODO: Finish this later
  // const analysisCount = Math.ceil(config.uptime / config.analysisPeriod);
  // const analysisTimes = range(analysisCount).map(
  //   (e) => (e + 1) * config.analysisPeriod
  // );
  // analysisTimes.splice(analysisCount - 1, 1);
  // analysisTimes.push(config.uptime);

  // function analyze(
  //   time: number,
  //   ops: Operation[],
  //   queue: QueuedOp[],
  //   idleTimes: number[]
  // ) {
  //   const servicedDemands = ops.filter((e) => e.finishTime < time).length;
  //   const idleTime = idleTimes
  //     .slice(0, ops.length)
  //     .reduce((total, e) => total + e, 0);
  //   const idleProb = idleTime / time;
  //   const loadedTime = time - idleTime;
  //   const loadedProb = 1 - idleProb;
  //   const demandsInSystem = queue.length + 1;
  //   const avg =
  //     ops
  //       .map((e, i) => e.queueAwaitTime + idleTimes[i])
  //       .reduce((total, e) => total + e, 0) / ops.length;

  //   items.push({
  //     it: idleTime,
  //     ip: idleProb,
  //     lt: loadedTime,
  //     lp: loadedProb,
  //     s: servicedDemands,
  //     u: demandsNotServiced,
  //     d: demandsInSystem,
  //     a: avg
  //   });

  // }
</script>

<Table {headers} {items} />
