import { ROAD_KEYS } from "./constants.js";

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function roundNumber(value, digits = 2) {
  return Number(value.toFixed(digits));
}

export function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

export function createRoadMap(initializer) {
  return ROAD_KEYS.reduce((map, road, index) => {
    map[road] = initializer(road, index);
    return map;
  }, {});
}

export function pushHistory(history, value, limit) {
  history.push(value);

  if (history.length > limit) {
    history.shift();
  }

  return history;
}

export function pseudoRandom(seed) {
  let value = seed >>> 0;
  value += 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

export function hashString(input) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function maxEntry(entries) {
  return entries.reduce(
    (best, entry) => (entry[1] > best[1] ? entry : best),
    entries[0],
  );
}

export function serializeVehicles(queue, tick) {
  return queue.slice(0, 10).map((vehicle) => ({
    id: vehicle.id,
    road: vehicle.road,
    movement: vehicle.movement,
    createdTick: vehicle.createdTick,
    waitedTicks: tick - vehicle.createdTick,
    priorityLevel: vehicle.priorityLevel,
    profileColor: vehicle.profileColor,
  }));
}
