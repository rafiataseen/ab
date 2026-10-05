import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Zap,
  Trophy,
  Users,
  ArrowLeft,
  Megaphone,
  Share2,
  RefreshCw,
} from "lucide-react";
import { API_URL } from "@/config";

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const rankStyle = (rank) =>
  rank === 1
    ? "bg-emerald-500 text-[#04101A]"
    : rank <= 3
      ? "bg-emerald-500/15 text-emerald-400"
      : "bg-white/5 text-slate-400";

export default function Leaderboard() {
  const [data, setData] = useState({ colleges: [], referrers: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    document.title = "Leaderboard — Workshop Launchpad";
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/leaderboard`);
        if (mounted) {
          setData(res.data);
          setLoadError(false);
        }
      } catch {
        if (mounted) setLoadError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const leaderCount = data.colleges[0]?.registrations || 1;

  return (
    <div
      data-testid="leaderboard-page"
      className="hero-grid-bg min-h-screen bg-[#070C18] text-slate-50"
    >
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" data-testid="leaderboard-logo">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-[#04101A]">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-bold tracking-tight sm:text-base">
            Workshop Launchpad
          </span>
        </Link>
        <Link
          data-testid="back-to-home-link"
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
        >
          <ArrowLeft size={13} /> Home
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          data-testid="leaderboard-banner"
          className="flex items-start gap-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:items-center sm:p-6"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-[#04101A]">
            <Megaphone size={20} />
          </span>
          <div>
            <p className="text-base font-bold leading-snug sm:text-lg">
              Is your college #1? Share your link and push it up the board.
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-300/80">
              <RefreshCw size={11} /> Live — auto-refreshes every 30 seconds
            </p>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 rounded-3xl border border-white/10 bg-[#0C1427] p-5 sm:p-7 lg:col-span-3"
          >
            <div className="flex items-center gap-2.5">
              <Trophy size={19} className="text-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight sm:text-xl">Top Colleges</h2>
            </div>

            <div data-testid="top-colleges-table" className="mt-5 space-y-2">
              {loadError && data.colleges.length === 0 && (
                <p
                  data-testid="leaderboard-error"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-center text-sm text-red-300"
                >
                  Couldn't load the leaderboard — check your connection. Retrying
                  automatically every 30 seconds.
                </p>
              )}
              {!loading && !loadError && data.colleges.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-slate-400">
                  No registrations yet — be the first to put your college on the board.
                </p>
              )}
              {data.colleges.map((c, i) => {
                const rank = i + 1;
                return (
                  <div
                    key={c.college}
                    data-testid={`college-row-${rank}`}
                    className={`rounded-2xl border px-4 py-3.5 ${
                      rank === 1
                        ? "border-emerald-500/40 bg-emerald-500/[0.07]"
                        : "border-white/[0.07] bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono-num flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${rankStyle(rank)}`}
                      >
                        {rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-100">
                          {c.college}
                        </p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.max(4, Math.round((c.registrations / leaderCount) * 100))}%`,
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                      <span className="font-mono-num shrink-0 text-sm font-bold text-emerald-400">
                        {c.registrations}
                      </span>
                      <a
                        data-testid={`college-share-${rank}`}
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `${c.college} is ranked #${rank} for the AI workshop. Help us reach #1: ${window.location.origin}/?src=college_${slugify(c.college)}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Share ${c.college}'s rank on WhatsApp`}
                        title="Share your college's rank"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366] transition-colors hover:bg-[#25D366]/25"
                      >
                        <Share2 size={15} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 rounded-3xl border border-white/10 bg-[#0C1427] p-5 sm:p-7 lg:col-span-2"
          >
            <div className="flex items-center gap-2.5">
              <Users size={19} className="text-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight sm:text-xl">Top Referrers</h2>
            </div>

            <div data-testid="top-referrers-table" className="mt-5 space-y-2">
              {!loading && data.referrers.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-slate-400">
                  No referrals yet — share your link after registering to claim the top
                  spot.
                </p>
              )}
              {data.referrers.map((r, i) => {
                const rank = i + 1;
                return (
                  <div
                    key={`${r.name}-${rank}`}
                    data-testid={`referrer-row-${rank}`}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 ${
                      rank === 1
                        ? "border-emerald-500/40 bg-emerald-500/[0.07]"
                        : "border-white/[0.07] bg-white/[0.02]"
                    }`}
                  >
                    <span
                      className={`font-mono-num flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${rankStyle(rank)}`}
                    >
                      {rank}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-100">
                      {r.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 font-mono-num text-xs font-bold text-emerald-400">
                      {r.referrals} referral{r.referrals === 1 ? "" : "s"}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
