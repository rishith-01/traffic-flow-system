import {
  ALGORITHMS,
  DEFAULT_CONFIG,
  DEFAULT_TRAFFIC_PROFILE,
} from "../constants.js";
import { roundNumber } from "../utils.js";
import { TrafficSimulation } from "./TrafficSimulation.js";

function sanitizeTrafficProfile(trafficProfile = {}) {
  return {
    ...DEFAULT_TRAFFIC_PROFILE,
    ...Object.fromEntries(
      Object.entries(trafficProfile).map(([road, value]) => [road, Number(value)]),
    ),
  };
}

function createScenarioConfig(id, name, config, algorithmOverride) {
  return {
    id,
    name,
    algorithm: algorithmOverride ?? config.algorithm,
    quantum: config.quantum,
    serviceRate: config.serviceRate,
    adaptiveSignals: config.adaptiveSignals,
    trafficProfile: config.trafficProfile,
  };
}

function createComparisonInsight(leftScenario, rightScenario) {
  if (!leftScenario || !rightScenario) {
    return null;
  }

  const throughputDelta = roundNumber(
    leftScenario.metrics.throughput - rightScenario.metrics.throughput,
    2,
  );
  const delayDelta = roundNumber(
    leftScenario.metrics.averageDelay - rightScenario.metrics.averageDelay,
    2,
  );
  const queuePressureDelta = roundNumber(
    leftScenario.metrics.queuePressure - rightScenario.metrics.queuePressure,
    2,
  );

  let winner = leftScenario.algorithm;
  if (rightScenario.metrics.efficiency > leftScenario.metrics.efficiency) {
    winner = rightScenario.algorithm;
  }

  return {
    throughputDelta,
    delayDelta,
    queuePressureDelta,
    winner,
    winnerEfficiency: Math.max(
      leftScenario.metrics.efficiency,
      rightScenario.metrics.efficiency,
    ),
  };
}

export class SimulationManager {
  constructor({ tickIntervalMs = 900 } = {}) {
    this.tickIntervalMs = tickIntervalMs;
    this.broadcastHandler = null;
    this.intervalId = null;
    this.clientCount = 0;
    this.running = false;
    this.config = {
      ...DEFAULT_CONFIG,
      trafficProfile: sanitizeTrafficProfile(DEFAULT_CONFIG.trafficProfile),
      comparison: {
        ...DEFAULT_CONFIG.comparison,
      },
    };
    this.liveScenario = new TrafficSimulation(
      createScenarioConfig("live", "Live Network", this.config),
    );
    this.comparisonScenarios = this.createComparisonScenarios();
  }

  createComparisonScenarios() {
    if (!this.config.comparison.enabled) {
      return null;
    }

    return {
      left: new TrafficSimulation(
        createScenarioConfig(
          "compare-left",
          "Comparison A",
          {
            ...this.config,
            adaptiveSignals: false,
          },
          this.config.comparison.leftAlgorithm,
        ),
      ),
      right: new TrafficSimulation(
        createScenarioConfig(
          "compare-right",
          "Comparison B",
          {
            ...this.config,
            adaptiveSignals: false,
          },
          this.config.comparison.rightAlgorithm,
        ),
      ),
    };
  }

  setBroadcastHandler(handler) {
    this.broadcastHandler = handler;
  }

  setClientCount(count) {
    this.clientCount = count;
    this.broadcast("client_update");
  }

  ensureInterval() {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      if (this.running) {
        this.step("interval_tick");
      }
    }, this.tickIntervalMs);
  }

  stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  start() {
    this.running = true;
    this.ensureInterval();
    this.broadcast("simulation_started");
    return this.getSnapshot("simulation_started");
  }

  pause() {
    this.running = false;
    this.broadcast("simulation_paused");
    return this.getSnapshot("simulation_paused");
  }

  reset() {
    this.running = false;
    this.liveScenario.reset();
    if (this.comparisonScenarios) {
      this.comparisonScenarios.left.reset();
      this.comparisonScenarios.right.reset();
    }
    this.broadcast("simulation_reset");
    return this.getSnapshot("simulation_reset");
  }

  step(reason = "manual_step") {
    this.liveScenario.tick();

    if (this.comparisonScenarios) {
      this.comparisonScenarios.left.tick();
      this.comparisonScenarios.right.tick();
    }

    this.broadcast(reason);
    return this.getSnapshot(reason);
  }

  configure(payload = {}) {
    const mergedConfig = {
      ...this.config,
      ...payload,
      trafficProfile: sanitizeTrafficProfile(
        payload.trafficProfile ?? this.config.trafficProfile,
      ),
      comparison: {
        ...this.config.comparison,
        ...(payload.comparison ?? {}),
      },
    };

    if (!Object.values(ALGORITHMS).includes(mergedConfig.algorithm)) {
      mergedConfig.algorithm = this.config.algorithm;
    }

    mergedConfig.quantum = Number(mergedConfig.quantum ?? this.config.quantum);
    mergedConfig.serviceRate = Number(
      mergedConfig.serviceRate ?? this.config.serviceRate,
    );
    mergedConfig.adaptiveSignals = Boolean(mergedConfig.adaptiveSignals);

    this.config = mergedConfig;

    this.liveScenario.configure(this.config);
    this.comparisonScenarios = this.createComparisonScenarios();
    this.broadcast("configuration_updated");
    return this.getSnapshot("configuration_updated");
  }

  handleControl(action) {
    switch (action) {
      case "start":
        return this.start();
      case "pause":
        return this.pause();
      case "reset":
        return this.reset();
      case "step":
        return this.step("manual_step");
      default:
        return this.getSnapshot("noop");
    }
  }

  getSnapshot(reason = "state_request") {
    const liveScenario = this.liveScenario.serialize();
    const leftScenario = this.comparisonScenarios?.left.serialize() ?? null;
    const rightScenario = this.comparisonScenarios?.right.serialize() ?? null;

    return {
      reason,
      generatedAt: new Date().toISOString(),
      running: this.running,
      tickIntervalMs: this.tickIntervalMs,
      connectedClients: this.clientCount,
      config: this.config,
      live: liveScenario,
      comparison: {
        enabled: this.config.comparison.enabled,
        left: leftScenario,
        right: rightScenario,
        insight: createComparisonInsight(leftScenario, rightScenario),
      },
    };
  }

  broadcast(reason) {
    if (!this.broadcastHandler) {
      return;
    }

    this.broadcastHandler(this.getSnapshot(reason));
  }

  dispose() {
    this.stopInterval();
  }
}
