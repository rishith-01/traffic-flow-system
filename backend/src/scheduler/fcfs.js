import { ROAD_KEYS, ROAD_LABELS } from "../constants.js";

export function selectFcfs(intersection) {
  const activeQueue =
    intersection.activeRoad && intersection.queues[intersection.activeRoad].length
      ? intersection.queues[intersection.activeRoad]
      : null;

  if (activeQueue) {
    return {
      road: intersection.activeRoad,
      schedulerState: {
        ...intersection.schedulerState,
        currentRoad: intersection.activeRoad,
      },
      reason: `${ROAD_LABELS[intersection.activeRoad]} keeps the CPU because FCFS is non-preemptive.`,
    };
  }

  const candidateRoads = ROAD_KEYS.filter(
    (road) => intersection.queues[road].length > 0,
  );

  if (!candidateRoads.length) {
    return {
      road: null,
      schedulerState: {
        ...intersection.schedulerState,
        currentRoad: null,
      },
      reason: "No vehicles are waiting, so the scheduler is idle.",
    };
  }

  const road = candidateRoads.reduce((selectedRoad, currentRoad) => {
    const currentHead = intersection.queues[currentRoad][0];

    if (!selectedRoad) {
      return currentRoad;
    }

    const selectedHead = intersection.queues[selectedRoad][0];
    return currentHead.createdTick < selectedHead.createdTick
      ? currentRoad
      : selectedRoad;
  }, null);

  return {
    road,
    schedulerState: {
      ...intersection.schedulerState,
      currentRoad: road,
    },
    reason: `${ROAD_LABELS[road]} has the earliest arrival in the system.`,
  };
}

