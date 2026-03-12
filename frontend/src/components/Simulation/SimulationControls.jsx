import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";

export function SimulationControls({ running, onControl }) {
  const buttons = [
    {
      label: running ? "Pause" : "Start",
      action: running ? "pause" : "start",
      icon: running ? Pause : Play,
      className: "bg-accent text-shell",
    },
    {
      label: "Step",
      action: "step",
      icon: StepForward,
      className: "bg-cyan/15 text-cyan border border-cyan/30",
    },
    {
      label: "Reset",
      action: "reset",
      icon: RotateCcw,
      className: "bg-alert/15 text-alert border border-alert/30",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel flex flex-wrap gap-3 rounded-[24px] p-4"
    >
      {buttons.map(({ label, action, icon: Icon, className }) => (
        <button
          key={label}
          type="button"
          onClick={() => onControl(action)}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold transition hover:scale-[1.02] ${className}`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </motion.div>
  );
}

