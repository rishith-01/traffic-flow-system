import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function chartFrame(title, subtitle, content) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.32em] text-slate-400">{title}</p>
        <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
      </div>
      <div className="h-72">{content}</div>
    </div>
  );
}

export function ThroughputChart({ series, comparisonSeries = [] }) {
  const data = series.map((point, index) => ({
    tick: point.tick,
    live: point.value,
    comparison: comparisonSeries[index]?.value ?? 0,
  }));

  return chartFrame(
    "Throughput",
    "Vehicles cleared per simulation tick.",
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="tick" stroke="#98a9c8" />
        <YAxis stroke="#98a9c8" />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="live"
          stroke="#4de6b1"
          strokeWidth={3}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="comparison"
          stroke="#67d4ff"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>,
  );
}

export function DelayTrendChart({ series }) {
  return chartFrame(
    "Delay Trend",
    "Average waiting delay across the traffic network.",
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={series}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="tick" stroke="#98a9c8" />
        <YAxis stroke="#98a9c8" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#ffbf5f"
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>,
  );
}

export function QueueDistributionChart({ queueLengths }) {
  const data = Object.entries(queueLengths).map(([road, value]) => ({
    road,
    queue: value,
  }));

  return chartFrame(
    "Queue Distribution",
    "Current queue depth per road across the network.",
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="road" stroke="#98a9c8" />
        <YAxis stroke="#98a9c8" />
        <Tooltip />
        <Bar dataKey="queue" fill="#ff7657" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>,
  );
}

export function ComparisonRadarChart({ leftScenario, rightScenario }) {
  const leftMetrics = leftScenario?.metrics ?? {
    throughput: 0,
    efficiency: 0,
    averageDelay: 0,
    queuePressure: 0,
  };
  const rightMetrics = rightScenario?.metrics ?? leftMetrics;
  const data = [
    {
      metric: "Throughput",
      left: leftMetrics.throughput,
      right: rightMetrics.throughput,
    },
    {
      metric: "Efficiency",
      left: leftMetrics.efficiency,
      right: rightMetrics.efficiency,
    },
    {
      metric: "Delay",
      left: leftMetrics.averageDelay,
      right: rightMetrics.averageDelay,
    },
    {
      metric: "Queue Pressure",
      left: leftMetrics.queuePressure,
      right: rightMetrics.queuePressure,
    },
  ];

  return chartFrame(
    "Algorithm Comparison",
    "Compare two scheduling strategies under the same traffic demand.",
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="metric" stroke="#98a9c8" />
        <PolarRadiusAxis stroke="#5f6d88" />
        <Radar
          name={leftScenario?.algorithmLabel ?? "Algorithm A"}
          dataKey="left"
          stroke="#4de6b1"
          fill="#4de6b1"
          fillOpacity={0.22}
        />
        <Radar
          name={rightScenario?.algorithmLabel ?? "Algorithm B"}
          dataKey="right"
          stroke="#67d4ff"
          fill="#67d4ff"
          fillOpacity={0.18}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>,
  );
}

