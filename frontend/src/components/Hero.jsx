import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, CalendarDays, ArrowRight, Trophy } from "lucide-react";
import Countdown from "@/components/Countdown";
import { WORKSHOP_DATE_LABEL } from "@/config";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxhaSUyMHJvYm90aWMlMjBmdXR1cmlzdGljJTIwYWJzdHJhY3QlMjBncmFwaGljfGVufDB8fHx8MTc5MTE4OTM3MXww&ixlib=rb-4.1.0&q=85";

const LINES = ["Build Your First", "AI Project", "in 60 Minutes"];
const TAGS = ["100% Free", "Beginner Friendly", "Live & Hands-on", "All Branches"];

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero({ onRegister, stats }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const pct = Math.min(100, Math.round((stats.total / stats.target) * 100));

  return (
    <section ref={ref} className="hero-grid-bg relative overflow-hidden">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5" data-testid="site-logo">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-[#04101A]">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-bold tracking-tight sm:text-base">
            Workshop Launchpad
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            data-testid="nav-leaderboard-link"
            to="/leaderboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
          >
            <Trophy size={13} className="text-emerald-400" />
            Leaderboard
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300 sm:flex">
            <CalendarDays size={13} className="text-emerald-400" />
            {WORKSHOP_DATE_LABEL}
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-8 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:pt-12">
        <div className="lg:col-span-7">
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Free Live Workshop · Online
          </motion.div>

          <h1
            data-testid="hero-headline"
            className="mt-6 text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  className={`block ${i === 1 ? "text-emerald-400" : ""}`}
                  initial={{ y: "115%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.15 + i * 0.13,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            {...fadeUp(0.55)}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg"
          >
            Free live workshop for final-year engineering students. No prior AI
            experience needed.
          </motion.p>

          <motion.div {...fadeUp(0.7)} className="mt-8">
            <motion.button
              data-testid="register-button"
              onClick={onRegister}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-[#04101A] shadow-[0_0_32px_rgba(16,185,129,0.35)] transition-colors hover:bg-emerald-400 sm:w-auto sm:text-lg"
            >
              Reserve My Free Seat
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.button>
          </motion.div>

          <motion.div {...fadeUp(0.85)} data-testid="seats-counter" className="mt-8 max-w-md">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold text-slate-200">
                <span className="font-mono-num text-emerald-400">{stats.total}</span> of{" "}
                <span className="font-mono-num">{stats.target}</span> seats claimed
              </span>
              <span className="font-mono-num text-xs text-slate-400">{pct}%</span>
            </div>
            <div
              data-testid="seats-progress-bar"
              className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          <motion.div {...fadeUp(1)} className="mt-10">
            <Countdown />
          </motion.div>

          <motion.div {...fadeUp(1.1)} className="mt-8 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: imgY }}
            className="relative"
          >
            <div
              className="absolute -inset-6 rounded-[2rem] bg-emerald-500/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative rotate-2 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              <img
                src={HERO_IMAGE}
                alt="Glowing 3D AI artwork on a dark digital grid"
                className="h-60 w-full object-cover sm:h-72 lg:h-[26rem]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070C18]/85 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 backdrop-blur">
                Live · Hands-on · 60 Min
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
