import { Trophy, Users } from "lucide-react";

export default function TopTables({ topColleges, topReferrers }) {
  const leader = topColleges[0]?.registrations || 1;
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0C1427] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-emerald-400" />
          <h2 className="text-sm font-bold tracking-tight sm:text-base">Top 10 Colleges</h2>
        </div>
        <div data-testid="admin-top-colleges" className="mt-4 space-y-2">
          {topColleges.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">No registrations yet.</p>
          )}
          {topColleges.map((c, i) => (
            <div key={c.college} className="flex items-center gap-3">
              <span className="font-mono-num w-6 text-right text-xs font-bold text-slate-500">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-200">{c.college}</p>
                  <span className="font-mono-num shrink-0 text-xs font-bold text-emerald-400">
                    {c.registrations}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.max(4, Math.round((c.registrations / leader) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0C1427] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-emerald-400" />
          <h2 className="text-sm font-bold tracking-tight sm:text-base">Top 10 Referrers</h2>
        </div>
        <div data-testid="admin-top-referrers" className="mt-4 space-y-2">
          {topReferrers.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">No referrals yet.</p>
          )}
          {topReferrers.map((r, i) => (
            <div
              key={r.code}
              className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5"
            >
              <span className="font-mono-num w-6 text-right text-xs font-bold text-slate-500">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-200">{r.name}</p>
                <p className="font-mono-num text-[10px] tracking-widest text-slate-500">
                  {r.code}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono-num text-xs font-bold text-emerald-400">
                {r.referrals}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
