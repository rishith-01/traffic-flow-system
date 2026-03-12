import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Gauge, SlidersHorizontal } from "lucide-react";
import {
  ALGORITHM_OPTIONS,
  ROAD_KEYS,
  ROAD_LABELS,
  formatPercent,
} from "../../utils/formatters.js";

export function AlgorithmSelector({ config, prediction, onApply }) {
  const [formState, setFormState] = useState(config);

  useEffect(() => {
    setFormState(config);
  }, [config]);

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateTrafficProfile(road, value) {
    setFormState((current) => ({
      ...current,
      trafficProfile: {
        ...current.trafficProfile,
        [road]: Number(value),
      },
    }));
  }

  function updateComparison(field, value) {
    setFormState((current) => ({
      ...current,
      comparison: {
        ...current.comparison,
        [field]: value,
      },
    }));
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[28px] p-5"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-cyan/80">
            Scheduler Configuration
          </p>
          <h2 className="section-title mt-2 text-2xl font-semibold">
            Tune the traffic controller like an OS scheduler
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-accent">
              <BrainCircuit className="h-4 w-4" />
              AI Recommendation
            </p>
            <p className="mt-2 text-lg font-semibold">
              {prediction?.suggestedAlgorithm?.replace("_", " ") ?? "FCFS"}
            </p>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gold">
              <Gauge className="h-4 w-4" />
              Suggested Quantum
            </p>
            <p className="mt-2 text-lg font-semibold">{prediction?.adaptiveQuantum ?? 3}</p>
          </div>
          <div className="rounded-2xl border border-cyan/20 bg-cyan/10 px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-cyan">
              <SlidersHorizontal className="h-4 w-4" />
              Confidence
            </p>
            <p className="mt-2 text-lg font-semibold">{formatPercent(prediction?.confidence)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Primary Algorithm
            </span>
            <select
              value={formState.algorithm}
              onChange={(event) => updateField("algorithm", event.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-shell px-3 py-3 text-sm outline-none"
            >
              {ALGORITHM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Time Quantum
            </span>
            <input
              type="range"
              min="2"
              max="6"
              step="1"
              value={formState.quantum}
              onChange={(event) => updateField("quantum", Number(event.target.value))}
              className="mt-4 w-full accent-accent"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-300">
              <span>2 ticks</span>
              <span>{formState.quantum} ticks</span>
              <span>6 ticks</span>
            </div>
          </label>

          <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Service Rate
            </span>
            <select
              value={formState.serviceRate}
              onChange={(event) =>
                updateField("serviceRate", Number(event.target.value))
              }
              className="mt-3 w-full rounded-xl border border-white/10 bg-shell px-3 py-3 text-sm outline-none"
            >
              {[1, 2, 3, 4].map((value) => (
                <option key={value} value={value}>
                  {value} vehicles / tick
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Adaptive Signals
              </span>
              <p className="mt-2 text-sm text-slate-300">
                Let the heuristic model adjust time quantum live.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateField("adaptiveSignals", !formState.adaptiveSignals)
              }
              className={`relative h-8 w-14 rounded-full border transition ${
                formState.adaptiveSignals
                  ? "border-accent/40 bg-accent/30"
                  : "border-white/10 bg-slate-800"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  formState.adaptiveSignals ? "left-8" : "left-1"
                }`}
              />
            </button>
          </label>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Input Traffic Density
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Shape the workload applied to each road queue.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateComparison("enabled", !formState.comparison.enabled)
              }
              className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.2em] ${
                formState.comparison.enabled
                  ? "border-cyan/40 bg-cyan/15 text-cyan"
                  : "border-white/10 bg-white/5 text-slate-300"
              }`}
            >
              Compare {formState.comparison.enabled ? "On" : "Off"}
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {ROAD_KEYS.map((road) => (
              <label key={road} className="block">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{ROAD_LABELS[road]}</span>
                  <span className="text-slate-300">
                    {formatPercent(formState.trafficProfile?.[road])}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.01"
                  value={formState.trafficProfile?.[road] ?? 0.5}
                  onChange={(event) => updateTrafficProfile(road, event.target.value)}
                  className="w-full accent-cyan"
                />
              </label>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="rounded-2xl border border-white/10 bg-shell/60 p-4">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Comparison A
              </span>
              <select
                value={formState.comparison.leftAlgorithm}
                onChange={(event) =>
                  updateComparison("leftAlgorithm", event.target.value)
                }
                className="mt-3 w-full rounded-xl border border-white/10 bg-shell px-3 py-3 text-sm outline-none"
              >
                {ALGORITHM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="rounded-2xl border border-white/10 bg-shell/60 p-4">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Comparison B
              </span>
              <select
                value={formState.comparison.rightAlgorithm}
                onChange={(event) =>
                  updateComparison("rightAlgorithm", event.target.value)
                }
                className="mt-3 w-full rounded-xl border border-white/10 bg-shell px-3 py-3 text-sm outline-none"
              >
                {ALGORITHM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="max-w-3xl text-sm text-slate-300">{prediction?.rationale}</p>
        <button
          type="button"
          onClick={() => onApply(formState)}
          className="rounded-full bg-accent px-6 py-3 font-semibold text-shell transition hover:brightness-110"
        >
          Apply Network Policy
        </button>
      </div>
    </motion.section>
  );
}

