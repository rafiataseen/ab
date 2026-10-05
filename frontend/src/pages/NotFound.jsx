import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft, Trophy } from "lucide-react";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found — Workshop Launchpad";
  }, []);

  return (
    <div
      data-testid="not-found-page"
      className="hero-grid-bg flex min-h-screen flex-col items-center justify-center bg-[#070C18] px-5 text-center text-slate-50"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-[#04101A]">
        <Zap size={22} strokeWidth={2.5} />
      </span>
      <p className="font-mono-num mt-8 text-6xl font-extrabold tracking-tight text-emerald-400 sm:text-7xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
        This page took a gap year.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
        The link you followed doesn't exist — but the workshop does, and your free seat is
        waiting.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          data-testid="not-found-home-link"
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-bold text-[#04101A] transition-colors hover:bg-emerald-400"
        >
          <ArrowLeft size={15} /> Back to the workshop
        </Link>
        <Link
          data-testid="not-found-leaderboard-link"
          to="/leaderboard"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
        >
          <Trophy size={15} /> View leaderboard
        </Link>
      </div>
    </div>
  );
}
