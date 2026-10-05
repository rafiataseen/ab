import { useEffect, useState } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  MessageCircle,
  CalendarPlus,
  Copy,
  ArrowLeft,
  Zap,
  Share2,
  Gift,
  Lock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  API_URL,
  WHATSAPP_COMMUNITY_LINK,
  GOOGLE_CALENDAR_URL,
  WORKSHOP_DATE_LABEL,
  REWARD_TIERS,
  whatsappShareUrl,
} from "@/config";

const CHECKLIST = [
  "Block your calendar — " + WORKSHOP_DATE_LABEL,
  "Join the WhatsApp community — the session link drops there first",
  "Share your referral link with batchmates before seats fill up",
];

export default function ThankYou() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const referralCode = (searchParams.get("code") || state?.referralCode || "")
    .trim()
    .toUpperCase();
  const [refStats, setRefStats] = useState(null);
  const [codeInvalid, setCodeInvalid] = useState(false);

  const name = state?.name || refStats?.first_name || "";
  const referralLink = referralCode
    ? `${window.location.origin}/?ref=${referralCode}`
    : "";

  useEffect(() => {
    if (!referralCode) return;
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/referrals/${referralCode}`);
        if (mounted) setRefStats(res.data);
      } catch (err) {
        if (mounted && err.response?.status === 404) setCodeInvalid(true);
      }
    };
    fetchStats();
    const id = setInterval(fetchStats, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [referralCode]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied — share it with your batchmates!");
    } catch {
      toast.error("Could not copy. Long-press the link to copy it.");
    }
  };

  const count = refStats?.referral_count ?? 0;
  const maxTier = REWARD_TIERS[REWARD_TIERS.length - 1]?.count || 10;
  const progressPct = Math.min(100, Math.round((count / maxTier) * 100));
  const nextTier = REWARD_TIERS.find((t) => count < t.count);
  const showReferral = referralCode && !codeInvalid;

  return (
    <div className="hero-grid-bg min-h-screen bg-[#070C18] px-5 py-10 text-slate-50 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-xl"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-[#04101A]">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-bold tracking-tight">Workshop Launchpad</span>
        </div>

        <div
          data-testid="thank-you-page"
          className="mt-10 rounded-3xl border border-white/10 bg-[#0C1427] p-7 sm:p-10"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 size={30} />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            You're in{name ? `, ${name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            Your free seat is reserved. We'll send the joining link on WhatsApp and
            email before the session — {WORKSHOP_DATE_LABEL}.
          </p>

          {showReferral && (
            <div className="mt-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                <Share2 size={14} /> Your referral link
              </div>
              <div className="mt-3 flex items-center gap-2">
                <code
                  data-testid="referral-link"
                  className="font-mono-num min-w-0 flex-1 truncate rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-slate-200 sm:text-sm"
                >
                  {referralLink}
                </code>
                <button
                  data-testid="copy-invite-link-button"
                  onClick={copyLink}
                  aria-label="Copy referral link"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-200 transition-colors hover:bg-white/10"
                >
                  <Copy size={17} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Code:{" "}
                  <span data-testid="referral-code" className="font-mono-num text-emerald-400">
                    {referralCode}
                  </span>
                </span>
                <span>Share it, climb the rewards</span>
              </div>

              <a
                data-testid="share-whatsapp-button"
                href={whatsappShareUrl(referralLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-base font-bold text-slate-950 shadow-[0_0_28px_rgba(37,211,102,0.3)] transition-colors hover:bg-[#20bd5a]"
              >
                <Share2 size={19} /> Share on WhatsApp
              </a>

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Users size={19} />
                </span>
                <p data-testid="referral-count" className="text-sm text-slate-200">
                  You've brought in{" "}
                  <span className="font-mono-num text-lg font-bold text-emerald-400">
                    {count}
                  </span>{" "}
                  friend{count === 1 ? "" : "s"}
                </p>
              </div>

              <div data-testid="reward-tiers" className="mt-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Gift size={14} className="text-emerald-400" /> Referral rewards
                </div>
                <div
                  data-testid="tier-progress-bar"
                  className="relative mt-4 h-2.5 overflow-visible rounded-full bg-white/10"
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  {REWARD_TIERS.map((t) => (
                    <span
                      key={t.count}
                      className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                        count >= t.count
                          ? "border-lime-300 bg-emerald-400"
                          : "border-slate-600 bg-[#0C1427]"
                      }`}
                      style={{ left: `${(t.count / maxTier) * 100}%` }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  {nextTier
                    ? `${nextTier.count - count} more friend${
                        nextTier.count - count === 1 ? "" : "s"
                      } to unlock “${nextTier.name}”`
                    : "All reward tiers unlocked — see you at the top!"}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {REWARD_TIERS.map((t) => {
                    const reached = count >= t.count;
                    return (
                      <li
                        key={t.count}
                        data-testid={`tier-${t.count}`}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                          reached
                            ? "border-emerald-500/40 bg-emerald-500/10 text-slate-100"
                            : "border-white/10 bg-white/[0.03] text-slate-400"
                        }`}
                      >
                        {reached ? (
                          <CheckCircle2 size={17} className="shrink-0 text-emerald-400" />
                        ) : (
                          <Lock size={15} className="shrink-0 text-slate-600" />
                        )}
                        <span className="font-mono-num shrink-0 font-bold text-emerald-400">
                          {t.count}
                        </span>
                        <span>{t.name}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <a
              data-testid="join-whatsapp-button"
              href={WHATSAPP_COMMUNITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-base font-bold text-slate-950 shadow-[0_0_28px_rgba(37,211,102,0.3)] transition-colors hover:bg-[#20bd5a]"
            >
              <MessageCircle size={19} /> Join the WhatsApp Community
            </a>
            <a
              data-testid="add-to-calendar-button"
              href={GOOGLE_CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-slate-800 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-slate-700"
            >
              <CalendarPlus size={19} /> Add to Google Calendar
            </a>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Before the workshop
            </p>
            <ul className="mt-3 space-y-2.5">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          data-testid="back-to-home-link"
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-emerald-400"
        >
          <ArrowLeft size={15} /> Back to the workshop page
        </Link>
      </motion.div>
    </div>
  );
}
