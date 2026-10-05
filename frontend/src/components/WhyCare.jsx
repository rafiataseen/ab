import { motion } from "framer-motion";
import { Trophy, TrendingUp, Code2 } from "lucide-react";

const CARDS = [
  {
    icon: Trophy,
    tag: "Placement Ready",
    title: "A Project for Your Resume & Interviews",
    body: "Walk into campus interviews with a real AI project you built yourself — something you can demo, explain and defend, not another tutorial clone.",
  },
  {
    icon: TrendingUp,
    tag: "Industry Reality",
    title: "AI Skills Employers Want in 2026",
    body: "Recruiters increasingly ask what you've actually built with AI. In one hour, you'll understand how modern AI apps work — by building one.",
  },
  {
    icon: Code2,
    tag: "100% Hands-on",
    title: "Learn by Building, Not Watching",
    body: "No long theory lectures or slide decks. We open the editor in the first few minutes and build together, step by step, until it works.",
  },
];

export default function WhyCare() {
  return (
    <section data-testid="why-care-section" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Why you should care
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            One hour. One project. A very different resume.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-2xl border border-white/10 bg-[#0C1427] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-emerald-500/40 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-400 transition-colors duration-300 group-hover:bg-emerald-500/20">
                  <card.icon size={21} />
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {card.tag}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold leading-snug sm:text-xl">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
