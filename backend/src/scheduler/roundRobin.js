import { ROAD_KEYS, ROAD_LABELS } from "../constants.js";

export function selectRoundRobin(intersection, quantum) {
  const availableRoads = ROAD_KEYS.filter(
    (road) => intersection.queues[road].length > 0,
  );

  if (!availableRoads.length) {
    return {
      road: null,
      schedulerState: {
        ...intersection.schedulerState,
        currentRoad: null,
        rrIndex: intersection.schedulerState.rrIndex ?? 0,
        quantumRemaining: quantum,
      },
      reason: "Round Robin is idle because all queues are empty.",
    };
  }

  const currentRoad = intersection.schedulerState.currentRoad;
  const quantumRemaining = intersection.schedulerState.quantumRemaining ?? quantum;

  if (
    currentRoad &&
    availableRoads.includes(currentRoad) &&
    quantumRemaining > 0
  ) {
    return {
      road: currentRoad,
      schedulerState: {
        ...intersection.schedulerState,
        currentRoad,
        quantumRemaining: quantumRemaining - 1,
      },
      reason: `${ROAD_LABELS[currentRoad]} keeps the green light until the time quantum expires.`,
    };
  }

  const startingIndex = intersection.schedulerState.rrIndex ?? 0;
  let nextRoad = availableRoads[0];
  let nextIndex = 0;

  for (let offset = 1; offset <= ROAD_KEYS.length; offset += 1) {
    const candidateIndex = (startingIndex + offset) % ROAD_KEYS.length;
    const candidateRoad = ROAD_KEYS[candidateIndex];

    if (availableRoads.includes(candidateRoad)) {
      nextRoad = candidateRoad;
      nextIndex = candidateIndex;
      break;
    }
  }

  return {
    road: nextRoad,
    schedulerState: {
      ...intersection.schedulerState,
      currentRoad: nextRoad,
      rrIndex: nextIndex,
      quantumRemaining: Math.max(quantum - 1, 0),
    },
    reason: `${ROAD_LABELS[nextRoad]} receives the CPU slice after the previous quantum ended.`,
  };
}

