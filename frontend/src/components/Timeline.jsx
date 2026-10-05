import { motion } from "framer-motion";

const STEPS = [
  {
    step: "01",
    time: "0 – 10 min",
    phase: "Setup",
    detail:
      "Get your free online workspace ready — no heavy installs, just a browser and you're in.",
  },
  {
    step: "02",
    time: "10 – 35 min",
    phase: "Build",
    detail:
      "Build your AI project step by step, following along live. Every line explained as we go.",
  },
  {
    step: "03",
    time: "35 – 50 min",
    phase: "Test",
    detail:
      "Try it out, break it, fix it. Learn how to make your project handle real-world inputs.",
  },
  {
    step: "04",
    time: "50 – 60 min",
    phase: "Show it off",
    detail:
      "Wrap up, see what everyone built, and walk away knowing exactly how to showcase it.",
  },
];

export default function Timeline() {
  return (
    <section
      data-testid="timeline-section"
      className="border-y border-white/5 bg-[#0A1120] px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            What you'll build
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            The 60-minute blueprint
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl border border-white/10 bg-[#0C1427] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-emerald-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-num text-3xl font-bold text-emerald-500/60">
                  {s.step}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono-num text-[11px] font-semibold text-emerald-400">
                  {s.time}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold sm:text-xl">{s.phase}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{s.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
