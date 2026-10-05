import { MousePointerClick, PencilLine, CheckCircle2 } from "lucide-react";

export default function Funnel({ funnel }) {
  const steps = [
    { icon: MousePointerClick, label: "Page visits", value: funnel.page_visits },
    { icon: PencilLine, label: "Form started", value: funnel.form_starts },
    { icon: CheckCircle2, label: "Registered", value: funnel.registered },
  ];
  const max = Math.max(funnel.page_visits, 1);
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0C1427] p-5 sm:p-6">
      <h2 className="text-sm font-bold tracking-tight sm:text-base">Conversion Funnel</h2>
      <p className="text-xs text-slate-500">Visit → start → register</p>
      <div data-testid="funnel-chart" className="mt-5 space-y-4">
        {steps.map((s, i) => {
          const prev = i > 0 ? steps[i - 1].value : null;
          const conv =
            prev && prev > 0 ? Math.round((s.value / prev) * 100) : null;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <s.icon size={15} className="text-emerald-400" />
                  {s.label}
                </span>
                <span className="font-mono-num font-bold text-emerald-400">
                  {s.value}
                  {conv !== null && (
                    <span className="ml-2 text-xs font-medium text-slate-500">
                      {conv}% of prev
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-[width] duration-700"
                  style={{ width: `${Math.max(2, Math.round((s.value / max) * 100))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
