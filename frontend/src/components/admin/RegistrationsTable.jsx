import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Search, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config";

export default function RegistrationsTable({ token }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const debounce = useRef(null);

  const load = async (p, query) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/registrations`, {
        params: { page: p, q: query },
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch {
      toast.error("Could not load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onSearch = (value) => {
    setQ(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setPage(1);
      load(1, value);
    }, 350);
  };

  const downloadCsv = async () => {
    setDownloading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/export.csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "registrations.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0C1427] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight sm:text-base">All Registrations</h2>
          <p className="text-xs text-slate-500">{data.total} total</p>
        </div>
        <button
          data-testid="download-csv-button"
          onClick={downloadCsv}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold text-[#04101A] transition-colors hover:bg-emerald-400 disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          Download CSV
        </button>
      </div>

      <div className="relative mt-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          data-testid="registrations-search"
          type="text"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search name, college, email, phone or code..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500/60"
        />
      </div>

      <div className="mt-4 overflow-x-auto" data-testid="registrations-table">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <th className="pb-2.5 pr-4 font-semibold">Name</th>
              <th className="pb-2.5 pr-4 font-semibold">College</th>
              <th className="pb-2.5 pr-4 font-semibold">Branch</th>
              <th className="pb-2.5 pr-4 font-semibold">WhatsApp</th>
              <th className="pb-2.5 pr-4 font-semibold">Email</th>
              <th className="pb-2.5 pr-4 font-semibold">Source</th>
              <th className="pb-2.5 pr-4 font-semibold">Ref By</th>
              <th className="pb-2.5 font-semibold">Code</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  <Loader2 size={18} className="mx-auto animate-spin" />
                </td>
              </tr>
            )}
            {!loading && data.items.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  No registrations found.
                </td>
              </tr>
            )}
            {!loading &&
              data.items.map((r) => (
                <tr
                  key={r.referral_code}
                  className="border-b border-white/5 text-slate-300"
                >
                  <td className="py-3 pr-4 font-semibold text-slate-100">{r.full_name}</td>
                  <td className="max-w-[160px] truncate py-3 pr-4">{r.college}</td>
                  <td className="max-w-[120px] truncate py-3 pr-4">{r.branch}</td>
                  <td className="py-3 pr-4 font-mono-num">{r.whatsapp_number}</td>
                  <td className="max-w-[180px] truncate py-3 pr-4">{r.email}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px]">
                      {r.source}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono-num text-slate-500">
                    {r.referred_by || "—"}
                  </td>
                  <td className="py-3 font-mono-num text-emerald-400">{r.referral_code}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Page {data.page} of {data.pages}
        </p>
        <div className="flex gap-2">
          <button
            data-testid="registrations-prev"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:text-emerald-400 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            data-testid="registrations-next"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.pages}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:text-emerald-400 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
