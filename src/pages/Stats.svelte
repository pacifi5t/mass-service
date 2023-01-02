<script lang="ts">
  import { Table } from "attractions";
  import * as sys from "../service-system";
  import { demandsStore, demandsCountStore, configStore } from "../stores";

  let items: sys.AnalysisItem[] = [];
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

  items = sys.analyze(demands, res, sys.genAnalysisTimeArr(config));
</script>

<Table {headers} {items} />
