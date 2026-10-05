import { useState } from "react";
import QRCode from "react-qr-code";
import { Link2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function LinkBuilder() {
  const [src, setSrc] = useState("");
  const clean = src
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const link = clean ? `${window.location.origin}/?src=${clean}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Tracking link copied!");
    } catch {
      toast.error("Could not copy — long-press the link instead.");
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0C1427] p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Link2 size={16} className="text-emerald-400" />
        <h2 className="text-sm font-bold tracking-tight sm:text-base">Link Builder</h2>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Create a tracked link for each WhatsApp group, club or channel — its registrations
        show up under that source in the chart above.
      </p>

      <input
        data-testid="link-builder-input"
        type="text"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
        placeholder="Source name, e.g. whatsapp_amrita_cse"
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500/60"
      />

      {link && (
        <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Your tracking link
            </p>
            <code
              data-testid="link-builder-output"
              className="font-mono-num mt-2 block break-all rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-emerald-300"
            >
              {link}
            </code>
            <button
              data-testid="link-builder-copy"
              onClick={copy}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold text-[#04101A] transition-colors hover:bg-emerald-400"
            >
              <Copy size={13} /> Copy link
            </button>
          </div>
          <div className="justify-self-center rounded-2xl border border-white/10 bg-[#070C18] p-4">
            <QRCode
              data-testid="link-builder-qr"
              value={link}
              size={150}
              bgColor="#070C18"
              fgColor="#10B981"
            />
            <p className="mt-2 text-center text-[10px] text-slate-500">
              Scan to test · screenshot for posters
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
