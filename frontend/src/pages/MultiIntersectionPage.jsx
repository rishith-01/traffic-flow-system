import { motion } from "framer-motion";
import { MultiIntersectionGrid } from "../components/MultiIntersection/MultiIntersectionGrid.jsx";
import { IntersectionThreeView } from "../components/Three/IntersectionThreeView.jsx";
import { useSimulationContext } from "../hooks/SimulationContext.jsx";

export function MultiIntersectionPage() {
  const { live, snapshot } = useSimulationContext();
  const primaryIntersection = live.intersections[0];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[28px] p-5"
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan/80">
              Multi-Intersection Orchestration
            </p>
            <h2 className="section-title mt-2 text-3xl font-semibold">
              Coordinated scheduling across a traffic network
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Watch four intersections share the same workload profile while each
              local controller makes CPU-like dispatch decisions. This view is useful
              for distributed scheduling demonstrations and systems research demos.
            </p>
          </div>

          <IntersectionThreeView activeRoad={primaryIntersection?.activeRoad} />
        </div>
      </motion.section>

      <MultiIntersectionGrid
        intersections={live.intersections}
        generatedAt={snapshot.generatedAt}
        tickIntervalMs={snapshot.tickIntervalMs}
      />
    </div>
  );
}
