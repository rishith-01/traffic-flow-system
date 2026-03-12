import { motion } from "framer-motion";
import { BrainCircuit, Sparkles } from "lucide-react";
import {
  ROAD_KEYS,
  ROAD_LABELS,
  formatAlgorithmLabel,
  formatPercent,
} from "../../utils/formatters.js";

export function PredictionPanel({ prediction }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[28px] p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-accent">
            <BrainCircuit className="h-4 w-4" />
            AI Traffic Prediction
          </p>
          <h3 className="section-title mt-2 text-2xl font-semibold">
            Predictive heuristics for traffic bursts
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            {prediction.rationale}
          </p>
        </div>

        <div className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-accent">
            <Sparkles className="h-4 w-4" />
            Suggested Policy
          </p>
          <p className="mt-2 text-xl font-semibold">
            {formatAlgorithmLabel(prediction.suggestedAlgorithm)}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Quantum {prediction.adaptiveQuantum} with {formatPercent(prediction.confidence)} confidence
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ROAD_KEYS.map((road) => (
          <div
            key={road}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {ROAD_LABELS[road]}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {formatPercent(prediction.predictedDensity[road])}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-alert"
                style={{
                  width: `${Math.min(prediction.predictedDensity[road] * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
