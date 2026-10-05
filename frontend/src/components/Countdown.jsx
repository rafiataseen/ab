import { useEffect, useState } from "react";
import { WORKSHOP_DATE_TIME } from "@/config";

function getParts() {
  const diff = Math.max(0, new Date(WORKSHOP_DATE_TIME).getTime() - Date.now());
  return [
    { label: "Days", value: Math.floor(diff / 86400000) },
    { label: "Hours", value: Math.floor(diff / 3600000) % 24 },
    { label: "Mins", value: Math.floor(diff / 60000) % 60 },
    { label: "Secs", value: Math.floor(diff / 1000) % 60 },
  ];
}

export default function Countdown() {
  const [parts, setParts] = useState(getParts);

  useEffect(() => {
    const id = setInterval(() => setParts(getParts()), 1000);
    return () => clearInterval(id);
  }, []);

  const isLive = parts.every((p) => p.value === 0);

  if (isLive) {
    return (
      <div
        data-testid="countdown-timer"
        className="inline-flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <p className="text-sm font-bold text-emerald-300">
          We're live right now — join from the WhatsApp community!
        </p>
      </div>
    );
  }

  return (
    <div data-testid="countdown-timer">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        Workshop starts in
      </p>
      <div className="mt-3 flex gap-2.5 sm:gap-3">
        {parts.map((p) => (
          <div
            key={p.label}
            className="flex min-w-[64px] flex-col items-center rounded-2xl border border-white/10 bg-[#0C1427] px-3 py-2.5 sm:min-w-[76px]"
          >
            <span className="font-mono-num text-2xl font-bold text-emerald-400 sm:text-3xl">
              {String(p.value).padStart(2, "0")}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
