import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Lenis from "lenis";
import { Zap } from "lucide-react";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import WhyCare from "@/components/WhyCare";
import Timeline from "@/components/Timeline";
import WhoFor from "@/components/WhoFor";
import Faq from "@/components/Faq";
import StickyBar from "@/components/StickyBar";
import RegisterModal from "@/components/RegisterModal";
import { API_URL, REGISTRATION_TARGET, WORKSHOP_DATE_LABEL } from "@/config";

export default function LandingPage() {
  const [searchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [tracking, setTracking] = useState({ source: "direct", referred_by: "" });
  const [stats, setStats] = useState({ total: 0, target: REGISTRATION_TARGET });

  useEffect(() => {
    const src = searchParams.get("src") || sessionStorage.getItem("wl_src") || "direct";
    const ref = searchParams.get("ref") || sessionStorage.getItem("wl_ref") || "";
    sessionStorage.setItem("wl_src", src);
    if (ref) sessionStorage.setItem("wl_ref", ref);
    setTracking({ source: src, referred_by: ref });
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("register") === "1") setModalOpen(true);
  }, [searchParams]);

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true });
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/stats`);
        if (mounted) setStats(res.data);
      } catch {
        /* keep last known stats */
      }
    };
    fetchStats();
    const id = setInterval(fetchStats, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070C18] text-slate-50">
      <Hero onRegister={openModal} stats={stats} />
      <Marquee />
      <WhyCare />
      <Timeline />
      <WhoFor onRegister={openModal} />
      <Faq />
      <footer className="border-t border-white/10 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-[#04101A]">
              <Zap size={15} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold tracking-tight">Workshop Launchpad</span>
          </div>
          <p className="text-xs text-slate-500">
            Free live workshop · {WORKSHOP_DATE_LABEL} · Online
          </p>
        </div>
      </footer>
      <div className="h-24 md:hidden" />
      <StickyBar onRegister={openModal} stats={stats} />
      <RegisterModal open={modalOpen} onOpenChange={setModalOpen} tracking={tracking} />
    </div>
  );
}
