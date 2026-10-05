import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Zap, Lock, LogOut, RefreshCw, Loader2 } from "lucide-react";
import { API_URL } from "@/config";
import Kpis from "@/components/admin/Kpis";
import AdminCharts from "@/components/admin/AdminCharts";
import TopTables from "@/components/admin/TopTables";
import Funnel from "@/components/admin/Funnel";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
import LinkBuilder from "@/components/admin/LinkBuilder";

const TOKEN_KEY = "wl_admin_token";

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (tok) => {
      const t = tok || token;
      if (!t) return;
      setRefreshing(true);
      try {
        const res = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          setToken("");
          setData(null);
        }
      } finally {
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { password });
      localStorage.setItem(TOKEN_KEY, res.data.token);
      setToken(res.data.token);
      setPassword("");
      load(res.data.token);
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Login failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setData(null);
  };

  if (!token) {
    return (
      <div className="hero-grid-bg flex min-h-screen items-center justify-center bg-[#070C18] px-5 text-slate-50">
        <form
          onSubmit={login}
          data-testid="admin-login-form"
          className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0C1427] p-8"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <Lock size={22} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Admin Login</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Workshop Launchpad organizer area.
          </p>
          <input
            data-testid="admin-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500/60"
          />
          {error && (
            <p data-testid="admin-login-error" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
          <button
            data-testid="admin-login-button"
            type="submit"
            disabled={loading || !password}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-bold text-[#04101A] transition-colors hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Log in
          </button>
          <Link
            to="/"
            className="mt-5 block text-center text-xs text-slate-500 transition-colors hover:text-emerald-400"
          >
            Back to the workshop page
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-[#070C18] text-slate-50">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-[#04101A]">
              <Zap size={18} strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight">Workshop Launchpad</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Admin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="admin-refresh-button"
              onClick={() => load()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:text-emerald-400"
              aria-label="Refresh dashboard"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              data-testid="admin-logout-button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:text-red-400"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-8">
        {!data ? (
          <div className="flex items-center justify-center gap-3 py-24 text-slate-400">
            <Loader2 size={20} className="animate-spin" /> Loading dashboard...
          </div>
        ) : (
          <>
            <Kpis kpis={data.kpis} />
            <AdminCharts daily={data.daily} bySource={data.by_source} />
            <TopTables topColleges={data.top_colleges} topReferrers={data.top_referrers} />
            <Funnel funnel={data.funnel} />
            <RegistrationsTable token={token} />
            <LinkBuilder />
          </>
        )}
      </main>
    </div>
  );
}
