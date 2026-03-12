import { HISTORY_LIMIT } from "../constants.js";
import {
  average,
  createRoadMap,
  pushHistory,
  roundNumber,
  serializeVehicles,
  sum,
} from "../utils.js";

function getQueueLengths(intersection) {
  return createRoadMap((road) => intersection.queues[road].length);
}

export function updateIntersectionMetrics(intersection, departedVehicles, tick) {
  const departedCount = departedVehicles.length;
  const totalWaitTime = departedVehicles.reduce(
    (wait, vehicle) => wait + (tick - vehicle.createdTick),
    0,
  );

  intersection.metrics.processedVehicles += departedCount;
  intersection.metrics.totalWaitTime += totalWaitTime;
  intersection.metrics.averageDelay = roundNumber(
    intersection.metrics.processedVehicles
      ? intersection.metrics.totalWaitTime / intersection.metrics.processedVehicles
      : 0,
    2,
  );

  departedVehicles.forEach((vehicle) => {
    intersection.metrics.throughputByRoad[vehicle.road] += 1;
  });

  const queueLengths = getQueueLengths(intersection);
  intersection.metrics.waitingByRoad = createRoadMap((road) =>
    roundNumber(
      average(
        intersection.queues[road].map((vehicle) => tick - vehicle.createdTick),
      ),
      2,
    ),
  );
  intersection.metrics.maxQueueLength = Math.max(
    intersection.metrics.maxQueueLength,
    ...Object.values(queueLengths),
  );

  pushHistory(
    intersection.metrics.throughputHistory,
    {
      tick,
      value: departedCount,
    },
    HISTORY_LIMIT,
  );
  pushHistory(
    intersection.metrics.delayHistory,
    {
      tick,
      value: intersection.metrics.averageDelay,
    },
    HISTORY_LIMIT,
  );
  pushHistory(
    intersection.metrics.queueHistory,
    {
      tick,
      total: sum(Object.values(queueLengths)),
      ...queueLengths,
    },
    HISTORY_LIMIT,
  );

  intersection.lastDepartures = serializeVehicles(departedVehicles, tick);
}

export function summarizeScenarioMetrics(intersections, tick, algorithm, quantum) {
  const processedVehicles = sum(
    intersections.map((intersection) => intersection.metrics.processedVehicles),
  );
  const totalWaitTime = sum(
    intersections.map((intersection) => intersection.metrics.totalWaitTime),
  );
  const queueLengths = createRoadMap((road) =>
    sum(intersections.map((intersection) => intersection.queues[road].length)),
  );
  const waitingByRoad = createRoadMap((road) =>
    roundNumber(
      average(
        intersections.map((intersection) => intersection.metrics.waitingByRoad[road]),
      ),
      2,
    ),
  );
  const throughputByRoad = createRoadMap((road) =>
    sum(intersections.map((intersection) => intersection.metrics.throughputByRoad[road])),
  );
  const averageDelay = processedVehicles
    ? roundNumber(totalWaitTime / processedVehicles, 2)
    : 0;
  const recentThroughput = Array.from({ length: HISTORY_LIMIT }, (_, historyIndex) => {
    const labelTick = Math.max(tick - HISTORY_LIMIT + historyIndex + 1, 0);
    const value = intersections.reduce((throughput, intersection) => {
      const point = intersection.metrics.throughputHistory.find(
        (entry) => entry.tick === labelTick,
      );
      return throughput + (point?.value ?? 0);
    }, 0);

    return {
      tick: labelTick,
      value,
    };
  }).filter((entry) => entry.tick > 0);

  const recentDelays = Array.from({ length: HISTORY_LIMIT }, (_, historyIndex) => {
    const labelTick = Math.max(tick - HISTORY_LIMIT + historyIndex + 1, 0);
    const values = intersections
      .map((intersection) =>
        intersection.metrics.delayHistory.find((entry) => entry.tick === labelTick)?.value,
      )
      .filter((value) => value !== undefined);

    return {
      tick: labelTick,
      value: roundNumber(average(values), 2),
    };
  }).filter((entry) => entry.tick > 0);

  const queuePressure = roundNumber(average(Object.values(queueLengths)), 2);
  const throughput = roundNumber(
    average(recentThroughput.slice(-6).map((entry) => entry.value)),
    2,
  );
  const efficiency = roundNumber(
    throughput / (1 + averageDelay + queuePressure / 2),
    2,
  );

  return {
    tick,
    algorithm,
    quantum,
    processedVehicles,
    averageDelay,
    queueLengths,
    waitingByRoad,
    throughputByRoad,
    throughput,
    queuePressure,
    efficiency,
    recentThroughput,
    recentDelays,
  };
}
