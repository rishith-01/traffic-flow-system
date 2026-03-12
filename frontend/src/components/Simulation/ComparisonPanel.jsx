import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { formatMetric } from "../../utils/formatters.js";

function ScenarioCard({ label, scenario, accent }) {
  if (!scenario) {
    return null;
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <p className={`text-xs uppercase tracking-[0.28em] ${accent}`}>{label}</p>
      <h3 className="mt-2 text-xl font-semibold">{scenario.algorithmLabel}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-shell/60 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Throughput
          </p>
          <p className="mt-2 text-lg font-semibold">
            {formatMetric(scenario.metrics.throughput)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-shell/60 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Avg Delay
          </p>
          <p className="mt-2 text-lg font-semibold">
            {formatMetric(scenario.metrics.averageDelay, " t")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ComparisonPanel({ comparison }) {
  if (!comparison.enabled || !comparison.left || !comparison.right) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[28px] p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan/80">
            Comparison Mode
          </p>
          <h2 className="section-title mt-2 text-2xl font-semibold">
            Two algorithms, one traffic demand profile
          </h2>
        </div>

        <div className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-accent">
            <Trophy className="h-4 w-4" />
            Current Winner
          </p>
          <p className="mt-2 text-lg font-semibold">
            {comparison.insight?.winner ?? comparison.left.algorithm}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ScenarioCard
          label="Scenario A"
          scenario={comparison.left}
          accent="text-accent"
        />
        <ScenarioCard
          label="Scenario B"
          scenario={comparison.right}
          accent="text-cyan"
        />
      </div>
    </motion.section>
  );
}

