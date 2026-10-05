import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  MessageCircle,
  CalendarPlus,
  Copy,
  ArrowLeft,
  Zap,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import {
  WHATSAPP_COMMUNITY_LINK,
  GOOGLE_CALENDAR_URL,
  WORKSHOP_DATE_LABEL,
} from "@/config";

const CHECKLIST = [
  "Block your calendar — " + WORKSHOP_DATE_LABEL,
  "Join the WhatsApp community — the session link drops there first",
  "Share your referral link with batchmates before seats fill up",
];

export default function ThankYou() {
  const { state } = useLocation();
  const name = state?.name || "";
  const referralCode = state?.referralCode || "";
  const shareLink = referralCode
    ? `${window.location.origin}/?ref=${referralCode}&src=referral`
    : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Invite link copied — share it with your batchmates!");
    } catch {
      toast.error("Could not copy. Long-press the link to copy it.");
    }
  };

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

          {referralCode && (
            <div className="mt-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                <Ticket size={14} /> Your referral code
              </div>
              <div
                data-testid="referral-code"
                className="font-mono-num mt-2 text-3xl font-bold tracking-[0.3em] text-slate-50"
              >
                {referralCode}
              </div>
              <button
                data-testid="copy-invite-link-button"
                onClick={copyLink}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
              >
                <Copy size={15} /> Copy invite link
              </button>
            </div>
          )}

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
