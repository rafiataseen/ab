import { useEffect, useState } from "react";
import axios from "axios";
import { FlaskConical, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config";

export default function DemoMode({ token, onChanged }) {
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const refresh = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/demo/status`, { headers });
      setCount(res.data.demo_count);
    } catch {
      /* status stays */
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seed = async () => {
    setBusy(true);
    try {
      const res = await axios.post(`${API_URL}/admin/demo/seed`, {}, { headers });
      setCount(res.data.demo_count);
      toast.success(res.data.message || `Loaded ${res.data.seeded} demo registrations`);
      onChanged?.();
    } catch {
      toast.error("Seeding failed — try again.");
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    setBusy(true);
    try {
      const res = await axios.delete(`${API_URL}/admin/demo`, { headers });
      setCount(0);
      toast.success(`Removed ${res.data.deleted} demo registrations`);
      onChanged?.();
    } catch {
      toast.error("Could not clear demo data — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      data-testid="demo-mode-section"
      className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-5 sm:p-6"
    >
      <div className="flex items-center gap-2">
        <FlaskConical size={16} className="text-amber-400" />
        <h2 className="text-sm font-bold tracking-tight sm:text-base">Demo Mode</h2>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        For your demo video: loads 150 realistic fake registrations across 12 colleges, 6
        sources and the last 7 days, with referrals. Every fake row is marked{" "}
        <code className="font-mono-num text-amber-300/80">is_demo</code> and can be removed
        in one click.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span
          data-testid="demo-count"
          className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 font-mono-num text-xs font-bold text-amber-300"
        >
          {count} demo rows
        </span>
        <button
          data-testid="demo-seed-button"
          onClick={seed}
          disabled={busy || count > 0}
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-xs font-bold text-[#04101A] transition-colors hover:bg-amber-300 disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
          Load demo data
        </button>
        <button
          data-testid="demo-clear-button"
          onClick={clear}
          disabled={busy || count === 0}
          className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          <Trash2 size={14} /> Clear demo data
        </button>
      </div>
    </section>
  );
}
