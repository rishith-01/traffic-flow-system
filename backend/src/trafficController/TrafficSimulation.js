import {
  ALGORITHM_LABELS,
  DEFAULT_TRAFFIC_PROFILE,
  HISTORY_LIMIT,
  INTERSECTION_LAYOUT,
  ROAD_KEYS,
} from "../constants.js";
import {
  summarizeScenarioMetrics,
  updateIntersectionMetrics,
} from "../analytics/metricsAnalyzer.js";
import {
  predictIntersectionTraffic,
  summarizeNetworkPrediction,
} from "../predictionEngine/heuristicModel.js";
import { resolveSchedulingDecision } from "../scheduler/index.js";
import {
  computeDynamicDensity,
  createVehicleBatch,
} from "../vehicleGenerator/index.js";
import {
  clamp,
  createRoadMap,
  pushHistory,
  serializeVehicles,
} from "../utils.js";

function buildIntersectionState(layout, index) {
  return {
    id: layout.id,
    name: layout.name,
    index,
    activeRoad: null,
    lastDecisionReason: "Waiting for traffic input.",
    schedulerState: {
      currentRoad: null,
      rrIndex: index % ROAD_KEYS.length,
      quantumRemaining: 0,
      priorityScore: 0,
    },
    queues: createRoadMap(() => []),
    densityHistory: createRoadMap(() => []),
    actualDensity: createRoadMap(() => 0),
    predictedDensity: createRoadMap(() => 0),
    signalState: createRoadMap(() => "red"),
    lastDepartures: [],
    prediction: {
      predictedDensity: createRoadMap(() => 0),
      suggestedAlgorithm: null,
      adaptiveQuantum: 3,
      confidence: 0.58,
      rationale: "Insufficient live data.",
    },
    metrics: {
      processedVehicles: 0,
      totalWaitTime: 0,
      averageDelay: 0,
      maxQueueLength: 0,
      waitingByRoad: createRoadMap(() => 0),
      throughputByRoad: createRoadMap(() => 0),
      throughputHistory: [],
      delayHistory: [],
      queueHistory: [],
    },
  };
}

function cloneTrafficProfile(trafficProfile) {
  return {
    ...DEFAULT_TRAFFIC_PROFILE,
    ...trafficProfile,
  };
}

function releaseVehicles(intersection, activeRoad, tick, serviceRate) {
  if (!activeRoad) {
    intersection.lastDepartures = [];
    return [];
  }

  const queue = intersection.queues[activeRoad];
  if (!queue.length) {
    intersection.lastDepartures = [];
    return [];
  }

  const departureBoost = queue.some((vehicle) => vehicle.priorityLevel === "emergency")
    ? 1
    : 0;
  const capacity = Math.min(queue.length, serviceRate + departureBoost);
  const departedVehicles = queue.splice(0, capacity).map((vehicle) => ({
    ...vehicle,
    departedTick: tick,
  }));

  intersection.lastDepartures = serializeVehicles(departedVehicles, tick);
  return departedVehicles;
}

function serializeIntersection(intersection, tick) {
  return {
    id: intersection.id,
    name: intersection.name,
    activeRoad: intersection.activeRoad,
    lastDecisionReason: intersection.lastDecisionReason,
    schedulerState: intersection.schedulerState,
    queueLengths: createRoadMap((road) => intersection.queues[road].length),
    queues: createRoadMap((road) => serializeVehicles(intersection.queues[road], tick)),
    actualDensity: intersection.actualDensity,
    predictedDensity: intersection.predictedDensity,
    signalState: intersection.signalState,
    lastDepartures: intersection.lastDepartures,
    prediction: intersection.prediction,
    metrics: {
      ...intersection.metrics,
      throughputHistory: intersection.metrics.throughputHistory.slice(-HISTORY_LIMIT),
      delayHistory: intersection.metrics.delayHistory.slice(-HISTORY_LIMIT),
      queueHistory: intersection.metrics.queueHistory.slice(-HISTORY_LIMIT),
    },
  };
}

export class TrafficSimulation {
  constructor({
    id,
    name,
    algorithm,
    quantum,
    serviceRate,
    adaptiveSignals = false,
    trafficProfile = DEFAULT_TRAFFIC_PROFILE,
    seed = 7,
    intersectionCount = INTERSECTION_LAYOUT.length,
  }) {
    this.id = id;
    this.name = name;
    this.algorithm = algorithm;
    this.quantum = quantum;
    this.serviceRate = serviceRate;
    this.adaptiveSignals = adaptiveSignals;
    this.seed = seed;
    this.tickCount = 0;
    this.baseTrafficProfile = cloneTrafficProfile(trafficProfile);
    this.intersections = INTERSECTION_LAYOUT.slice(0, intersectionCount).map(
      buildIntersectionState,
    );
    this.predictionSummary = {
      predictedDensity: cloneTrafficProfile(trafficProfile),
      suggestedAlgorithm: algorithm,
      adaptiveQuantum: quantum,
      confidence: 0.58,
      rationale: "The prediction engine is waiting for enough runtime history.",
    };
    this.scenarioMetrics = summarizeScenarioMetrics(
      this.intersections,
      this.tickCount,
      this.algorithm,
      this.quantum,
    );
  }

  configure({
    algorithm,
    quantum,
    serviceRate,
    adaptiveSignals,
    trafficProfile,
  }) {
    if (algorithm) {
      this.algorithm = algorithm;
    }

    if (quantum) {
      this.quantum = clamp(Number(quantum), 2, 6);
    }

    if (serviceRate) {
      this.serviceRate = clamp(Number(serviceRate), 1, 4);
    }

    if (typeof adaptiveSignals === "boolean") {
      this.adaptiveSignals = adaptiveSignals;
    }

    if (trafficProfile) {
      this.baseTrafficProfile = cloneTrafficProfile(trafficProfile);
    }

    this.scenarioMetrics = summarizeScenarioMetrics(
      this.intersections,
      this.tickCount,
      this.algorithm,
      this.quantum,
    );
  }

  reset() {
    const {
      id,
      name,
      algorithm,
      quantum,
      serviceRate,
      adaptiveSignals,
      baseTrafficProfile,
      seed,
    } = this;

    Object.assign(
      this,
      new TrafficSimulation({
        id,
        name,
        algorithm,
        quantum,
        serviceRate,
        adaptiveSignals,
        trafficProfile: baseTrafficProfile,
        seed,
        intersectionCount: this.intersections.length,
      }),
    );
  }

  tick() {
    this.tickCount += 1;

    this.intersections.forEach((intersection) => {
      const actualDensity = computeDynamicDensity({
        baseProfile: this.baseTrafficProfile,
        tick: this.tickCount,
        intersectionIndex: intersection.index,
        seed: `${this.seed}-${this.id}`,
      });
      intersection.actualDensity = actualDensity;

      ROAD_KEYS.forEach((road) => {
        pushHistory(
          intersection.densityHistory[road],
          actualDensity[road],
          HISTORY_LIMIT,
        );
      });

      intersection.prediction = predictIntersectionTraffic(intersection, actualDensity);
      intersection.predictedDensity = intersection.prediction.predictedDensity;

      const incomingVehicles = createVehicleBatch({
        scenarioId: this.id,
        intersectionId: intersection.id,
        actualDensity,
        tick: this.tickCount,
        seed: `${this.seed}-${intersection.index}`,
      });

      ROAD_KEYS.forEach((road) => {
        intersection.queues[road].push(...incomingVehicles[road]);
      });

      const effectiveQuantum = this.adaptiveSignals
        ? intersection.prediction.adaptiveQuantum
        : this.quantum;

      const decision = resolveSchedulingDecision({
        algorithm: this.algorithm,
        intersection,
        quantum: effectiveQuantum,
        predictedDensity: intersection.predictedDensity,
        tick: this.tickCount,
      });

      intersection.activeRoad = decision.road;
      intersection.schedulerState = {
        ...intersection.schedulerState,
        ...decision.schedulerState,
      };
      intersection.lastDecisionReason = decision.reason;
      intersection.signalState = createRoadMap((road) =>
        road === decision.road ? "green" : intersection.queues[road].length ? "amber" : "red",
      );

      const departedVehicles = releaseVehicles(
        intersection,
        decision.road,
        this.tickCount,
        this.serviceRate,
      );

      updateIntersectionMetrics(intersection, departedVehicles, this.tickCount);
    });

    this.predictionSummary = summarizeNetworkPrediction(this.intersections);
    if (this.adaptiveSignals) {
      this.quantum = this.predictionSummary.adaptiveQuantum;
    }

    this.scenarioMetrics = summarizeScenarioMetrics(
      this.intersections,
      this.tickCount,
      this.algorithm,
      this.quantum,
    );
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      clock: this.tickCount,
      algorithm: this.algorithm,
      algorithmLabel: ALGORITHM_LABELS[this.algorithm],
      quantum: this.quantum,
      serviceRate: this.serviceRate,
      adaptiveSignals: this.adaptiveSignals,
      baseTrafficProfile: this.baseTrafficProfile,
      prediction: this.predictionSummary,
      metrics: this.scenarioMetrics,
      intersections: this.intersections.map((intersection) =>
        serializeIntersection(intersection, this.tickCount),
      ),
    };
  }
}
