export const ROAD_KEYS = ["north", "east", "south", "west"];

export const ROAD_LABELS = {
  north: "Northbound",
  east: "Eastbound",
  south: "Southbound",
  west: "Westbound",
};

export const MOVEMENTS = ["straight", "left", "right"];

export const ALGORITHMS = {
  FCFS: "fcfs",
  ROUND_ROBIN: "round_robin",
  PRIORITY: "priority",
};

export const ALGORITHM_LABELS = {
  [ALGORITHMS.FCFS]: "First Come First Serve",
  [ALGORITHMS.ROUND_ROBIN]: "Round Robin",
  [ALGORITHMS.PRIORITY]: "Priority Scheduling",
};

export const DEFAULT_TRAFFIC_PROFILE = {
  north: 0.58,
  east: 0.71,
  south: 0.52,
  west: 0.63,
};

export const DEFAULT_CONFIG = {
  algorithm: ALGORITHMS.FCFS,
  quantum: 3,
  serviceRate: 2,
  adaptiveSignals: false,
  trafficProfile: DEFAULT_TRAFFIC_PROFILE,
  comparison: {
    enabled: true,
    leftAlgorithm: ALGORITHMS.FCFS,
    rightAlgorithm: ALGORITHMS.PRIORITY,
  },
};

export const INTERSECTION_LAYOUT = [
  { id: "INT-01", name: "Central Square" },
  { id: "INT-02", name: "Library Junction" },
  { id: "INT-03", name: "Market Exchange" },
  { id: "INT-04", name: "Transit Gate" },
];

export const HISTORY_LIMIT = 36;

