import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const TOOLTIP_STYLE = {
  background: "#111C38",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  fontSize: 12,
};
const LABEL_STYLE = { color: "#94A3B8" };

export default function AdminCharts({ daily, bySource }) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0C1427] p-5 sm:p-6">
        <h2 className="text-sm font-bold tracking-tight sm:text-base">
          Registrations per day
        </h2>
        <p className="text-xs text-slate-500">Last 7 days (IST)</p>
        <div data-testid="daily-chart" className="mt-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => d.slice(5)}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ fill: "#10B981", r: 3.5 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0C1427] p-5 sm:p-6">
        <h2 className="text-sm font-bold tracking-tight sm:text-base">
          Registrations by source
        </h2>
        <p className="text-xs text-slate-500">Which link pulled them in</p>
        <div data-testid="source-chart" className="mt-4">
          {bySource.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bySource} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
                <XAxis
                  dataKey="source"
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={52}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {bySource.map((s, i) => (
                    <Cell key={s.source} fill={i === 0 ? "#10B981" : "#0E9F6E55"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
