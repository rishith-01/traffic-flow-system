import { useState } from "react";
import { useSimulationContext } from "../hooks/SimulationContext.jsx";
import { AlgorithmSelector } from "../components/AlgorithmSelector/AlgorithmSelector.jsx";
import { IntersectionPanel } from "../components/intersection/IntersectionPanel.jsx";
import { ComparisonPanel } from "../components/Simulation/ComparisonPanel.jsx";
import { SimulationControls } from "../components/Simulation/SimulationControls.jsx";

export function SimulationPage() {
  const { snapshot, live, config, control, configure, comparison } =
    useSimulationContext();
  const [selectedIntersectionId, setSelectedIntersectionId] = useState(
    live.intersections[0]?.id,
  );
  const selectedIntersection =
    live.intersections.find(
      (intersection) => intersection.id === selectedIntersectionId,
    ) ?? live.intersections[0];

  return (
    <div className="space-y-6">
      <SimulationControls running={snapshot.running} onControl={control} />

      <AlgorithmSelector
        config={config}
        prediction={live.prediction}
        onApply={configure}
      />

      <div className="glass-panel rounded-[28px] p-4">
        <div className="flex flex-wrap gap-3">
          {live.intersections.map((intersection) => (
            <button
              key={intersection.id}
              type="button"
              onClick={() => setSelectedIntersectionId(intersection.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                selectedIntersection.id === intersection.id
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan/30 hover:text-cyan"
              }`}
            >
              {intersection.name}
            </button>
          ))}
        </div>
      </div>

      <IntersectionPanel
        intersection={selectedIntersection}
        generatedAt={snapshot.generatedAt}
        tickIntervalMs={snapshot.tickIntervalMs}
      />

      <ComparisonPanel comparison={comparison} />
    </div>
  );
}

