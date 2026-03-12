export const ROAD_KEYS = ["north", "east", "south", "west"];

export const ROAD_LABELS = {
  north: "Northbound",
  east: "Eastbound",
  south: "Southbound",
  west: "Westbound",
};

export const ALGORITHM_OPTIONS = [
  { value: "fcfs", label: "FCFS" },
  { value: "round_robin", label: "Round Robin" },
  { value: "priority", label: "Priority" },
];

function createRoadMap(initialValue) {
  return ROAD_KEYS.reduce((map, road) => {
    map[road] =
      typeof initialValue === "function" ? initialValue(road) : initialValue;
    return map;
  }, {});
}

export function formatAlgorithmLabel(value) {
  return (
    ALGORITHM_OPTIONS.find((algorithm) => algorithm.value === value)?.label ??
    "Unknown"
  );
}

export function formatMetric(value, suffix = "") {
  return `${Number(value ?? 0).toFixed(2)}${suffix}`;
}

export function formatPercent(value) {
  return `${Math.round(Number(value ?? 0) * 100)}%`;
}

export function createInitialSnapshot() {
  const queueHistory = [];
  const throughputHistory = [];
  const delayHistory = [];
  const emptyIntersection = {
    id: "INT-00",
    name: "Loading intersection",
    activeRoad: null,
    lastDecisionReason: "Connecting to simulator backend.",
    schedulerState: {
      currentRoad: null,
      rrIndex: 0,
      quantumRemaining: 0,
      priorityScore: 0,
    },
    queueLengths: createRoadMap(0),
    queues: createRoadMap([]),
    actualDensity: createRoadMap(0),
    predictedDensity: createRoadMap(0),
    signalState: createRoadMap("red"),
    lastDepartures: [],
    prediction: {
      predictedDensity: createRoadMap(0),
      suggestedAlgorithm: "fcfs",
      adaptiveQuantum: 3,
      confidence: 0.58,
      rationale: "Awaiting first state frame.",
    },
    metrics: {
      processedVehicles: 0,
      totalWaitTime: 0,
      averageDelay: 0,
      maxQueueLength: 0,
      waitingByRoad: createRoadMap(0),
      throughputByRoad: createRoadMap(0),
      throughputHistory,
      delayHistory,
      queueHistory,
    },
  };

  return {
    reason: "boot",
    generatedAt: new Date().toISOString(),
    running: false,
    tickIntervalMs: 900,
    connectedClients: 0,
    config: {
      algorithm: "fcfs",
      quantum: 3,
      serviceRate: 2,
      adaptiveSignals: false,
      trafficProfile: createRoadMap(0.5),
      comparison: {
        enabled: true,
        leftAlgorithm: "fcfs",
        rightAlgorithm: "priority",
      },
    },
    live: {
      id: "live",
      name: "Live Network",
      clock: 0,
      algorithm: "fcfs",
      algorithmLabel: "First Come First Serve",
      quantum: 3,
      serviceRate: 2,
      adaptiveSignals: false,
      baseTrafficProfile: createRoadMap(0.5),
      prediction: {
        predictedDensity: createRoadMap(0),
        suggestedAlgorithm: "fcfs",
        adaptiveQuantum: 3,
        confidence: 0.58,
        rationale: "Awaiting first state frame.",
      },
      metrics: {
        tick: 0,
        algorithm: "fcfs",
        quantum: 3,
        processedVehicles: 0,
        averageDelay: 0,
        queueLengths: createRoadMap(0),
        waitingByRoad: createRoadMap(0),
        throughputByRoad: createRoadMap(0),
        throughput: 0,
        queuePressure: 0,
        efficiency: 0,
        recentThroughput: [],
        recentDelays: [],
      },
      intersections: Array.from({ length: 4 }, (_, index) => ({
        ...emptyIntersection,
        id: `INT-0${index + 1}`,
        name: `Intersection ${index + 1}`,
      })),
    },
    comparison: {
      enabled: true,
      left: null,
      right: null,
      insight: null,
    },
  };
}

