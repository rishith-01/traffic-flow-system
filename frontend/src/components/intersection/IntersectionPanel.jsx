import { motion } from "framer-motion";
import { Clock3, Gauge, MoveRight } from "lucide-react";
import { IntersectionCanvas } from "./IntersectionCanvas.jsx";
import {
  ROAD_KEYS,
  ROAD_LABELS,
  formatMetric,
  formatPercent,
} from "../../utils/formatters.js";

export function IntersectionPanel({
  intersection,
  generatedAt,
  tickIntervalMs,
  compact = false,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden rounded-[28px] p-4"
    >
      <div className={`grid gap-5 ${compact ? "" : "xl:grid-cols-[1.15fr_0.85fr]"}`}>
        <div className="min-w-0">
          <IntersectionCanvas
            intersection={intersection}
            tickIntervalMs={tickIntervalMs}
            generatedAt={generatedAt}
            compact={compact}
          />
        </div>

        <div className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-slate-400">
                <MoveRight className="h-4 w-4" />
                Active Road
              </p>
              <p className="mt-2 text-lg font-semibold">
                {intersection.activeRoad
                  ? ROAD_LABELS[intersection.activeRoad]
                  : "Idle"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-slate-400">
                <Clock3 className="h-4 w-4" />
                Avg Delay
              </p>
              <p className="mt-2 text-lg font-semibold">
                {formatMetric(intersection.metrics.averageDelay, " t")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-slate-400">
                <Gauge className="h-4 w-4" />
                Processed
              </p>
              <p className="mt-2 text-lg font-semibold">
                {intersection.metrics.processedVehicles}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {ROAD_KEYS.map((road) => (
              <div
                key={road}
                className="rounded-2xl border border-white/10 bg-shell/70 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{ROAD_LABELS[road]}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                    {intersection.queueLengths[road]} queued
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Wait {formatMetric(intersection.metrics.waitingByRoad[road], " t")}</span>
                  <span>Density {formatPercent(intersection.actualDensity[road])}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-accent"
                    style={{
                      width: `${Math.min(intersection.actualDensity[road] * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
