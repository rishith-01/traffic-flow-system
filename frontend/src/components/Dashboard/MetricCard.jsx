import { motion } from "framer-motion";

export function MetricCard({ title, value, helper, tone = "cyan" }) {
  const toneClasses = {
    cyan: "border-cyan/30 bg-cyan/10 text-cyan",
    gold: "border-gold/30 bg-gold/10 text-gold",
    accent: "border-accent/30 bg-accent/10 text-accent",
    alert: "border-alert/30 bg-alert/10 text-alert",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[24px] p-4"
    >
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.26em] ${
          toneClasses[tone] ?? toneClasses.cyan
        }`}
      >
        {title}
      </span>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{helper}</p>
    </motion.div>
  );
}

