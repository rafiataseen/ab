import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Zap,
  ArrowLeft,
  Sparkles,
  Loader2,
  Quote,
  Share2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { API_URL } from "@/config";

const QUESTIONS = [
  {
    key: "branch",
    q: "What is your branch?",
    options: ["CSE / IT", "ECE / EEE", "Mech / Civil", "Other"],
  },
  {
    key: "interest",
    q: "What do you enjoy most?",
    options: [
      "Chatting with apps",
      "Images and cameras",
      "Data and predictions",
      "Automating boring tasks",
    ],
  },
  {
    key: "comfort",
    q: "Your coding comfort?",
    options: ["Beginner", "Some Python", "Confident"],
  },
];

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

export default function ProjectMatcher() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const choose = async (key, value) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/project-idea`, next);
      setResult(res.data.idea);
    } catch {
      setError("Something went wrong — tap any answer to try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setError("");
  };

  const forward = new URLSearchParams();
  const src = searchParams.get("src");
  const ref = searchParams.get("ref");
  if (src) forward.set("src", src);
  if (ref) forward.set("ref", ref);
  forward.set("register", "1");
  const registerLink = `/?${forward.toString()}`;

  const shareUrl = result
    ? `https://wa.me/?text=${encodeURIComponent(
        `My first AI project idea: "${result.title}" — ${result.description} Find yours in 30 seconds: ${window.location.origin}/project-matcher`
      )}`
    : "#";

  const question = QUESTIONS[step];

  return (
    <div
      data-testid="project-matcher-page"
      className="hero-grid-bg flex min-h-screen flex-col bg-[#070C18] text-slate-50"
    >
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" data-testid="matcher-logo">
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

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-16 pt-6 sm:px-8">
        {!result && !loading && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Find Your First AI Project
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                30 seconds to your perfect first build
              </h1>
              <div className="mt-6 flex items-center gap-2" data-testid="quiz-progress">
                {QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i <= step ? "bg-emerald-400" : "bg-white/10"
                    }`}
                  />
                ))}
                <span className="font-mono-num ml-2 text-xs text-slate-400">
                  {step + 1} / {QUESTIONS.length}
                </span>
              </div>
            </motion.div>

            <div className="mt-10 flex-1">
              <AnimatePresence mode="wait">
                <motion.div key={step} {...slide}>
                  <h2
                    data-testid="quiz-question"
                    className="text-xl font-bold tracking-tight sm:text-2xl"
                  >
                    {question.q}
                  </h2>
                  <div className="mt-6 space-y-3">
                    {question.options.map((opt, i) => (
                      <motion.button
                        key={opt}
                        data-testid={`answer-option-${step}-${i}`}
                        onClick={() => choose(question.key, opt)}
                        whileTap={{ scale: 0.98 }}
                        className="w-full rounded-2xl border border-white/10 bg-[#0C1427] px-6 py-5 text-left text-base font-semibold text-slate-100 transition-[border-color,background-color] duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/10 sm:text-lg"
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                  {error && (
                    <p data-testid="quiz-error" className="mt-4 text-sm text-red-400">
                      {error}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-testid="quiz-loading"
            className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
          >
            <Loader2 size={36} className="animate-spin text-emerald-400" />
            <p className="text-base font-semibold text-slate-200">
              Finding your project idea...
            </p>
            <p className="text-sm text-slate-400">
              Matching your branch, interests and comfort level.
            </p>
          </motion.div>
        )}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Your first AI project
            </p>
            <div
              data-testid="result-card"
              className="mt-4 rounded-3xl border border-emerald-500/30 bg-[#0C1427] p-6 shadow-[0_0_40px_rgba(16,185,129,0.12)] sm:p-8"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                <Sparkles size={11} /> Matched for you
              </span>
              <h2 data-testid="result-title" className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {result.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                {result.description}
              </p>
              <ol className="mt-6 space-y-3">
                {result.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3" data-testid={`result-step-${i + 1}`}>
                    <span className="font-mono-num flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-xs font-bold text-emerald-400">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed text-slate-300">{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <Quote size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                <p data-testid="result-recruiter-line" className="text-sm italic leading-relaxed text-slate-300">
                  {result.recruiter_line}
                </p>
              </div>
            </div>

            <a
              data-testid="share-project-whatsapp"
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-base font-bold text-slate-950 shadow-[0_0_28px_rgba(37,211,102,0.3)] transition-colors hover:bg-[#20bd5a]"
            >
              <Share2 size={19} /> Share my project idea
            </a>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
              <p className="text-sm leading-relaxed text-slate-300">
                Want to build this live with a mentor?
              </p>
              <Link
                data-testid="reserve-seat-cta"
                to={registerLink}
                className="group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 text-base font-bold text-[#04101A] shadow-[0_0_28px_rgba(16,185,129,0.3)] transition-colors hover:bg-emerald-400"
              >
                Reserve your free seat
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <button
              data-testid="retake-quiz-button"
              onClick={reset}
              className="mx-auto mt-5 flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-emerald-400"
            >
              <RotateCcw size={14} /> Retake the quiz
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
