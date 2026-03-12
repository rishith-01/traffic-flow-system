import { useDeferredValue } from "react";
import { MetricCard } from "../components/Dashboard/MetricCard.jsx";
import { PredictionPanel } from "../components/Dashboard/PredictionPanel.jsx";
import {
  ComparisonRadarChart,
  DelayTrendChart,
  QueueDistributionChart,
  ThroughputChart,
} from "../components/charts/TrafficCharts.jsx";
import { useSimulationContext } from "../hooks/SimulationContext.jsx";
import { formatMetric } from "../utils/formatters.js";

export function DashboardPage() {
  const { live, comparison } = useSimulationContext();
  const deferredLive = useDeferredValue(live);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Vehicles Processed"
          value={deferredLive.metrics.processedVehicles}
          helper="Total vehicles scheduled through all active intersections."
          tone="accent"
        />
        <MetricCard
          title="Throughput"
          value={formatMetric(deferredLive.metrics.throughput)}
          helper="Average network throughput over the recent tick window."
          tone="cyan"
        />
        <MetricCard
          title="Average Delay"
          value={formatMetric(deferredLive.metrics.averageDelay, " ticks")}
          helper="Mean waiting time before a vehicle gets a green signal."
          tone="gold"
        />
        <MetricCard
          title="Efficiency"
          value={formatMetric(deferredLive.metrics.efficiency)}
          helper="Composite score favoring high throughput and low queue pressure."
          tone="alert"
        />
      </div>

      <PredictionPanel prediction={deferredLive.prediction} />

      <div className="grid gap-5 xl:grid-cols-2">
        <ThroughputChart
          series={deferredLive.metrics.recentThroughput}
          comparisonSeries={comparison.left?.metrics.recentThroughput}
        />
        <DelayTrendChart series={deferredLive.metrics.recentDelays} />
        <QueueDistributionChart queueLengths={deferredLive.metrics.queueLengths} />
        <ComparisonRadarChart
          leftScenario={comparison.left}
          rightScenario={comparison.right}
        />
      </div>
    </div>
  );
}

