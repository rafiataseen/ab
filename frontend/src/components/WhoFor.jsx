import { motion } from "framer-motion";
import { Cpu, CircuitBoard, Cog, GraduationCap, ArrowRight } from "lucide-react";

const IMAGE =
  "https://images.unsplash.com/photo-1686624386665-4cd01b96d0f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBzdHVkZW50JTIwZW5naW5lZXJpbmclMjBjb2xsZWdlfGVufDB8fHx8MTc5MTE4OTM2MHww&ixlib=rb-4.1.0&q=85";

const BRANCHES = [
  {
    icon: Cpu,
    branch: "CSE / IT",
    highlight: "Add a hands-on AI build to your existing web and app skills.",
  },
  {
    icon: CircuitBoard,
    branch: "ECE / EEE",
    highlight: "Bridge your hardware intuition with modern software AI.",
  },
  {
    icon: Cog,
    branch: "Mech / Civil / Others",
    highlight: "A genuine edge for IT placements and tech-analyst roles.",
  },
  {
    icon: GraduationCap,
    branch: "Complete Beginners",
    highlight: "No AI or coding background needed — we start from zero.",
  },
];

export default function WhoFor({ onRegister }) {
  return (
    <section data-testid="who-for-section" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:col-span-5"
        >
          <div
            className="absolute -inset-6 rounded-[2rem] bg-emerald-500/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative -rotate-2 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <img
              src={IMAGE}
              alt="Indian engineering students studying together"
              className="h-64 w-full object-cover sm:h-80 lg:h-[24rem]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070C18]/85 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 backdrop-blur">
              Final Year · Any Branch
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Who is this for
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Made for final-year students of every branch
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Whether you code every day or have never written a line, this session is
              built so you leave with a working project.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {BRANCHES.map((b, i) => (
              <motion.div
                key={b.branch}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-white/10 bg-[#0C1427] p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-emerald-500/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-400">
                  <b.icon size={19} />
                </span>
                <h3 className="mt-4 text-base font-semibold sm:text-lg">{b.branch}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {b.highlight}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.button
            data-testid="who-for-register-button"
            onClick={onRegister}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-7 py-3.5 text-sm font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20"
          >
            Save my seat
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
