import { MOVEMENTS } from "../constants.js";
import {
  clamp,
  createRoadMap,
  hashString,
  pseudoRandom,
  roundNumber,
} from "../utils.js";

const VEHICLE_PALETTE = ["cyan", "gold", "mint", "coral"];

function randomFor(seed, ...parts) {
  return pseudoRandom(hashString([seed, ...parts].join(":")));
}

export function computeDynamicDensity({
  baseProfile,
  tick,
  intersectionIndex,
  seed,
}) {
  return createRoadMap((road, roadIndex) => {
    const wave = Math.sin((tick + intersectionIndex * 2 + roadIndex * 3) / 3.3) * 0.1;
    const burst = Math.cos((tick + roadIndex * 4) / 5.5) * 0.06;
    const noise =
      (randomFor(seed, "density", tick, intersectionIndex, roadIndex) - 0.5) * 0.18;

    return roundNumber(
      clamp(baseProfile[road] + wave + burst + noise, 0.12, 0.96),
      2,
    );
  });
}

function computeDemandCount(density, seed, tick, intersectionId, road, ordinal) {
  const stochasticBoost =
    randomFor(seed, "count", tick, intersectionId, road, ordinal) * 1.5;
  const rawDemand = density * 4.2 + stochasticBoost;
  const count = Math.round(rawDemand);

  if (density > 0.72) {
    return Math.max(count, 2);
  }

  return clamp(count, 0, 6);
}

function createVehicle({
  scenarioId,
  intersectionId,
  road,
  tick,
  density,
  seed,
  ordinal,
}) {
  const movementIndex = Math.floor(
    randomFor(seed, "movement", scenarioId, intersectionId, road, tick, ordinal) *
      MOVEMENTS.length,
  );
  const emergencyProbability =
    density > 0.7 ? 0.12 : density > 0.5 ? 0.07 : 0.04;
  const priorityLevel =
    randomFor(seed, "priority", scenarioId, intersectionId, road, tick, ordinal) <
    emergencyProbability
      ? "emergency"
      : "standard";
  const profileColor =
    VEHICLE_PALETTE[
      Math.floor(
        randomFor(seed, "color", scenarioId, intersectionId, road, tick, ordinal) *
          VEHICLE_PALETTE.length,
      )
    ];

  return {
    id: `${scenarioId}-${intersectionId}-${road}-${tick}-${ordinal}`,
    road,
    movement: MOVEMENTS[movementIndex],
    priorityLevel,
    profileColor,
    createdTick: tick,
  };
}

export function createVehicleBatch({
  scenarioId,
  intersectionId,
  actualDensity,
  tick,
  seed,
}) {
  return createRoadMap((road) => {
    const count = computeDemandCount(
      actualDensity[road],
      seed,
      tick,
      intersectionId,
      road,
      "batch",
    );

    return Array.from({ length: count }, (_, ordinal) =>
      createVehicle({
        scenarioId,
        intersectionId,
        road,
        tick,
        density: actualDensity[road],
        seed,
        ordinal,
      }),
    );
  });
}

