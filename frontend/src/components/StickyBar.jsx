import { motion } from "framer-motion";

export default function StickyBar({ onRegister, stats }) {
  const left = Math.max(0, stats.target - stats.total);
  return (
    <motion.div
      initial={{ y: 90 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl md:hidden"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-slate-50">Free · 60 minutes</p>
          <p data-testid="seats-left-note" className="text-xs text-emerald-400">
            {left > 0 ? `${left} seats left` : "Seats filling fast"}
          </p>
        </div>
        <button
          data-testid="sticky-register-button"
          onClick={onRegister}
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-[#04101A] shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-colors active:bg-emerald-400"
        >
          Register Now
        </button>
      </div>
    </motion.div>
  );
}
