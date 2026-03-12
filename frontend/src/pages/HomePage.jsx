import { motion } from "framer-motion";
import { ArrowRight, Binary, Clock3, Route, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useSimulationContext } from "../hooks/SimulationContext.jsx";
import { MetricCard } from "../components/Dashboard/MetricCard.jsx";
import { formatMetric } from "../utils/formatters.js";

const conceptCards = [
  {
    title: "Vehicles = Processes",
    body: "Every car is a schedulable workload carrying arrival time, movement type, and priority metadata.",
    icon: Binary,
  },
  {
    title: "Roads = Ready Queues",
    body: "Each inbound road maintains its own queue depth, wait time, and density just like a process run queue.",
    icon: Route,
  },
  {
    title: "Signals = CPU",
    body: "A green phase is CPU execution, and each scheduler decides which queue owns the next service slice.",
    icon: Clock3,
  },
];

export function HomePage() {
  const { live, control, snapshot } = useSimulationContext();

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden rounded-[32px] p-6 sm:p-8"
      >
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-accent">
              <Sparkles className="h-4 w-4" />
              Production-level OS simulation
            </p>
            <h2 className="section-title mt-5 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
              A live smart-city traffic control lab for studying CPU scheduling algorithms
            </h2>
            <p className="mt-5 max-w-3xl text-base text-slate-300 sm:text-lg">
              Explore FCFS, Round Robin, and Priority Scheduling through an animated
              traffic intersection that behaves like a CPU scheduler managing process
              queues under changing load.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => control(snapshot.running ? "pause" : "start")}
                className="rounded-full bg-accent px-6 py-3 font-semibold text-shell transition hover:brightness-110"
              >
                {snapshot.running ? "Pause Simulation" : "Start Simulation"}
              </button>
              <Link
                to="/simulation"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-100 transition hover:border-cyan/30 hover:text-cyan"
              >
                Open Simulator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <MetricCard
              title="Primary Algorithm"
              value={live.algorithmLabel}
              helper="Current policy running in the live intersection network."
              tone="accent"
            />
            <MetricCard
              title="Vehicles Processed"
              value={live.metrics.processedVehicles}
              helper="Cumulative number of vehicles cleared through all intersections."
              tone="cyan"
            />
            <MetricCard
              title="Average Delay"
              value={formatMetric(live.metrics.averageDelay, " ticks")}
              helper="Average time each vehicle waits before being scheduled."
              tone="gold"
            />
          </div>
        </div>
      </motion.section>

      <section className="grid gap-5 xl:grid-cols-3">
        {conceptCards.map(({ title, body, icon: Icon }, index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="glass-panel rounded-[28px] p-5"
          >
            <div className="inline-flex rounded-2xl bg-cyan/10 p-3 text-cyan">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="section-title mt-4 text-2xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
          </motion.article>
        ))}
      </section>
    </div>
  );
}

