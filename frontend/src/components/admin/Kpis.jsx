import { Users, Target, CalendarClock, Share2, School } from "lucide-react";

export default function Kpis({ kpis }) {
  const cards = [
    { icon: Users, label: "Total Registrations", value: kpis.total, sub: `of ${kpis.target} seats` },
    { icon: Target, label: "% of Target", value: `${kpis.pct_of_target}%`, sub: "500-seat goal" },
    { icon: CalendarClock, label: "Registered Today", value: kpis.today, sub: "since midnight IST" },
    { icon: Share2, label: "Referral-Driven", value: `${kpis.referral_share}%`, sub: "came via a friend's link" },
    { icon: School, label: "Unique Colleges", value: kpis.unique_colleges, sub: "on the board" },
  ];
  return (
    <section
      data-testid="kpi-cards"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-white/10 bg-[#0C1427] p-4 sm:p-5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-400">
            <c.icon size={17} />
          </span>
          <p className="font-mono-num mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {c.value}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-300">{c.label}</p>
          <p className="text-[11px] text-slate-500">{c.sub}</p>
        </div>
      ))}
    </section>
  );
}
