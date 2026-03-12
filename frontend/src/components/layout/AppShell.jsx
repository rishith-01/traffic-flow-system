import { motion } from "framer-motion";
import { Activity, BarChart3, Cpu, Network, RadioTower } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSimulationContext } from "../../hooks/SimulationContext.jsx";
import { formatMetric } from "../../utils/formatters.js";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Cpu },
  { to: "/simulation", label: "Simulation", icon: RadioTower },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/network", label: "Multi-Intersection", icon: Network },
];

function StatusChip({ connectionStatus }) {
  const palette = {
    connected: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    connecting: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
    reconnecting: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    degraded: "bg-orange-500/15 text-orange-300 border-orange-400/30",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
        palette[connectionStatus] ?? palette.connecting
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-current signal-glow" />
      {connectionStatus}
    </span>
  );
}

export function AppShell({ children }) {
  const { live, connectionStatus, lastAck, snapshot } = useSimulationContext();

  return (
    <div className="min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-8">
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel mx-auto mb-6 max-w-7xl rounded-[28px] p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-accent/10 p-3 text-accent">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan/80">
                Smart Traffic Signal Scheduling Simulator
              </p>
              <h1 className="section-title mt-1 text-2xl font-bold sm:text-3xl">
                Operating system scheduling rendered as a live traffic network
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Vehicles behave like processes, roads act as ready queues, and each
                signal phase visualizes CPU scheduling decisions in real time.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <StatusChip connectionStatus={connectionStatus} />
            <p className="max-w-sm text-right text-xs text-slate-400">{lastAck}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex flex-wrap gap-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-accent/40 bg-accent/15 text-accent"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan/30 hover:text-cyan"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                Clock
              </p>
              <p className="mt-2 text-xl font-semibold">{live.clock}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                Throughput
              </p>
              <p className="mt-2 text-xl font-semibold">
                {formatMetric(live.metrics.throughput)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                Avg Delay
              </p>
              <p className="mt-2 text-xl font-semibold">
                {formatMetric(live.metrics.averageDelay, " t")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                Clients
              </p>
              <p className="mt-2 text-xl font-semibold">{snapshot.connectedClients}</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl">{children}</main>
    </div>
  );
}

