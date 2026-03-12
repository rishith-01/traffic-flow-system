import { ALGORITHMS } from "../constants.js";
import { average, clamp, createRoadMap, roundNumber } from "../utils.js";

function predictRoadDensity(history, currentDensity, queueLength) {
  const recent = history.slice(-4);
  const recentAverage = average(recent);
  const trend =
    recent.length >= 2 ? recent[recent.length - 1] - recent[recent.length - 2] : 0;
  const queuePressure = queueLength / 10;

  return roundNumber(
    clamp(
      currentDensity * 0.45 +
        recentAverage * 0.35 +
        trend * 0.4 +
        queuePressure * 0.2,
      0.1,
      1,
    ),
    2,
  );
}

export function predictIntersectionTraffic(intersection, currentDensity) {
  const predictedDensity = createRoadMap((road) =>
    predictRoadDensity(
      intersection.densityHistory[road],
      currentDensity[road],
      intersection.queues[road].length,
    ),
  );

  const densityValues = Object.values(predictedDensity);
  const averageDensity = average(densityValues);
  const densitySpread = Math.max(...densityValues) - Math.min(...densityValues);
  const maxQueueLength = Math.max(
    ...Object.values(createRoadMap((road) => intersection.queues[road].length)),
  );

  let suggestedAlgorithm = ALGORITHMS.FCFS;
  let rationale =
    "Traffic is balanced and light, so FCFS provides clear queue semantics.";

  if (densitySpread > 0.24 || maxQueueLength >= 8) {
    suggestedAlgorithm = ALGORITHMS.PRIORITY;
    rationale =
      "Predicted surges are uneven, so a priority policy should drain the hottest road first.";
  } else if (averageDensity > 0.6) {
    suggestedAlgorithm = ALGORITHMS.ROUND_ROBIN;
    rationale =
      "Sustained high load favors Round Robin to share green time fairly across roads.";
  }

  return {
    predictedDensity,
    suggestedAlgorithm,
    adaptiveQuantum: Math.max(2, Math.min(5, Math.round(1 + averageDensity * 5))),
    confidence: roundNumber(
      clamp(0.58 + densitySpread * 0.7 + averageDensity * 0.16, 0.58, 0.94),
      2,
    ),
    rationale,
  };
}

export function summarizeNetworkPrediction(intersections) {
  const predictedDensity = createRoadMap((road) =>
    roundNumber(
      average(
        intersections.map((intersection) => intersection.prediction.predictedDensity[road]),
      ),
      2,
    ),
  );

  const suggestions = intersections.reduce((accumulator, intersection) => {
    const key = intersection.prediction.suggestedAlgorithm;
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  const suggestedAlgorithm = Object.entries(suggestions).sort(
    (left, right) => right[1] - left[1],
  )[0]?.[0] ?? ALGORITHMS.FCFS;

  return {
    predictedDensity,
    suggestedAlgorithm,
    adaptiveQuantum: Math.round(
      average(intersections.map((intersection) => intersection.prediction.adaptiveQuantum)),
    ),
    confidence: roundNumber(
      average(intersections.map((intersection) => intersection.prediction.confidence)),
      2,
    ),
    rationale:
      intersections.find(
        (intersection) =>
          intersection.prediction.suggestedAlgorithm === suggestedAlgorithm,
      )?.prediction.rationale ?? "Heuristic model recommends the currently selected policy.",
  };
}

