import { ALGORITHMS } from "../constants.js";
import { selectFcfs } from "./fcfs.js";
import { selectRoundRobin } from "./roundRobin.js";
import { selectPriority } from "./priority.js";

export function resolveSchedulingDecision({
  algorithm,
  intersection,
  quantum,
  predictedDensity,
  tick,
}) {
  switch (algorithm) {
    case ALGORITHMS.ROUND_ROBIN:
      return selectRoundRobin(intersection, quantum);
    case ALGORITHMS.PRIORITY:
      return selectPriority(intersection, predictedDensity, tick);
    case ALGORITHMS.FCFS:
    default:
      return selectFcfs(intersection);
  }
}
