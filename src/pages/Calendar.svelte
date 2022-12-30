<script lang="ts">
  import { Operation, QueuedOp } from "../service-system";
  import { demandsStore, demandsCountStore, configStore } from "../stores";

  const config = $configStore;
  const demands = $demandsStore.slice(0, $demandsCountStore);
  const demandPushTimes = demands
    .map((e) => e.delay)
    .map((_, i, arr) => arr.slice(0, i + 1).reduce((total, e) => total + e));
  const pushed: { pushTime: number; serviceTime: number }[] =
    demandPushTimes.map((e, i) =>
      Object({ pushTime: e, serviceTime: demands[i].serviceTime })
    );
  console.table(pushed);

  const queue: QueuedOp[] = [];
  const operations: Operation[] = [];
  let demandsNotServiced = 0;
  let workerIdleTime = 0;

  for (let i = 0; i < demandPushTimes.length; i++) {
    const time = demandPushTimes[i];
    const serviceTime = pushed[i].serviceTime;

    if (config.uptime < time) {
      demandsNotServiced += pushed.length - i;
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
      const t = operations[i - 1]?.finishTime;
      if (t !== undefined) {
        prevFinishTime = t;
      }
    }

    // Add demand to queue or service it
    if (prevFinishTime > time) {
      if (queue.length >= config.maxQueueLength) {
        demandsNotServiced++;
        continue;
      }

      const finishTime = prevFinishTime + serviceTime;
      const queueAwaitTime = prevFinishTime - time;
      queue.push(new QueuedOp(time, prevFinishTime, finishTime));
      operations.push(
        new Operation(prevFinishTime, finishTime, queueAwaitTime)
      );
    } else {
      operations.push(new Operation(time, time + serviceTime, 0));
      workerIdleTime += time - prevFinishTime;
    }
  }

  console.table(operations);
  console.log("Demands not serviced:", demandsNotServiced);
  console.log("Worker idle time:", workerIdleTime);
</script>
