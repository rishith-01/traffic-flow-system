import { ROAD_KEYS, ROAD_LABELS } from "../constants.js";
import { maxEntry, roundNumber } from "../utils.js";

function computeRoadPriority(intersection, road, predictedDensity, tick) {
  const queue = intersection.queues[road];
  const queueLength = queue.length;
  const waitingAge =
    queueLength > 0 ? tick - queue[0].createdTick : 0;
  const emergencyBoost = queue.filter(
    (vehicle) => vehicle.priorityLevel === "emergency",
  ).length;

  return roundNumber(
    queueLength * 2.4 +
      waitingAge * 0.8 +
      predictedDensity[road] * 7 +
      emergencyBoost * 5,
    2,
  );
}

export function selectPriority(intersection, predictedDensity, tick) {
  const candidates = ROAD_KEYS.filter(
    (road) => intersection.queues[road].length > 0,
  ).map((road) => [
    road,
    computeRoadPriority(intersection, road, predictedDensity, tick),
  ]);

  if (!candidates.length) {
    return {
      road: null,
      schedulerState: {
        ...intersection.schedulerState,
        currentRoad: null,
      },
      reason: "Priority scheduling is idle because there is no active traffic load.",
    };
  }

  const [road, priorityScore] = maxEntry(candidates);

  return {
    road,
    schedulerState: {
      ...intersection.schedulerState,
      currentRoad: road,
      priorityScore,
    },
    reason: `${ROAD_LABELS[road]} wins with a priority score of ${priorityScore}.`,
  };
}

