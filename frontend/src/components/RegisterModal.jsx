import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/config";

const BRANCHES = [
  "Computer Science & Engineering (CSE)",
  "Information Technology (IT)",
  "Electronics & Communication (ECE)",
  "Electrical & Electronics (EEE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Data Science / AI & ML",
  "Chemical / Biotech / Other",
];

const GRAD_YEARS = ["2026 (Final Year)", "2027", "2025 (Recent Grad)", "Other"];

const POPULAR_COLLEGES = [
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kharagpur",
  "IIT Hyderabad",
  "NIT Trichy",
  "NIT Warangal",
  "NIT Surathkal",
  "BITS Pilani",
  "IIIT Hyderabad",
  "VIT Vellore",
  "SRM Institute of Science and Technology",
  "Anna University",
  "Manipal Institute of Technology",
  "Delhi Technological University",
  "Jadavpur University",
  "RV College of Engineering",
  "PES University",
  "JNTU Hyderabad",
  "Amrita Vishwa Vidyapeetham",
  "Thapar Institute of Engineering and Technology",
  "PSG College of Technology",
  "SSN College of Engineering",
  "KL University",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

const INPUT_CLS =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500/60 focus:bg-white/[0.07]";

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </label>
      {children}
      {error && (
        <p data-testid="field-error" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterModal({ open, onOpenChange, tracking }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    college: "",
    branch: "",
    grad_year: "2026 (Final Year)",
    whatsapp_number: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [collegeFocus, setCollegeFocus] = useState(false);
  const [serverColleges, setServerColleges] = useState([]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  useEffect(() => {
    const q = form.college.trim();
    if (q.length < 2) {
      setServerColleges([]);
      return;
    }
    const t = setTimeout(() => {
      axios
        .get(`${API_URL}/colleges`, { params: { q } })
        .then((res) => setServerColleges(res.data.colleges || []))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [form.college]);

  const suggestions = useMemo(() => {
    const q = form.college.trim().toLowerCase();
    const local = q
      ? POPULAR_COLLEGES.filter((c) => c.toLowerCase().includes(q))
      : POPULAR_COLLEGES.slice(0, 8);
    return [...new Set([...serverColleges, ...local])].slice(0, 8);
  }, [form.college, serverColleges]);

  const validate = () => {
    const er = {};
    if (form.full_name.trim().length < 2) er.full_name = "Please enter your full name";
    if (form.college.trim().length < 2) er.college = "Please enter your college name";
    if (!form.branch) er.branch = "Select your branch";
    if (!form.grad_year) er.grad_year = "Select your graduation year";
    if (!PHONE_RE.test(form.whatsapp_number.trim()))
      er.whatsapp_number = "Enter a valid 10-digit Indian mobile number";
    if (!EMAIL_RE.test(form.email.trim())) er.email = "Enter a valid email address";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/register`, {
        full_name: form.full_name.trim(),
        college: form.college.trim(),
        branch: form.branch,
        grad_year: form.grad_year,
        whatsapp_number: form.whatsapp_number.trim(),
        email: form.email.trim(),
        source: tracking.source || "direct",
        referred_by: tracking.referred_by || null,
      });
      onOpenChange(false);
      navigate("/thank-you", {
        state: { name: res.data.full_name, referralCode: res.data.referral_code },
      });
    } catch (err) {
      if (err.response?.status === 409) {
        setFormError(err.response.data?.detail || "You're already registered!");
      } else if (err.response?.status === 422) {
        setFormError("Please double-check your details — something doesn't look right.");
      } else {
        setFormError("Something went wrong on our side. Please try again in a moment.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="registration-modal"
        className="max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-slate-50 sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
            Reserve your free seat
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            Takes 30 seconds. The joining link lands on your WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 space-y-4" noValidate>
          <Field label="Full Name" error={errors.full_name}>
            <input
              data-testid="input-full-name"
              type="text"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className={INPUT_CLS}
              autoComplete="name"
            />
          </Field>

          <Field label="College / University" error={errors.college}>
            <div className="relative">
              <input
                data-testid="input-college"
                type="text"
                value={form.college}
                onChange={(e) => set("college", e.target.value)}
                onFocus={() => setCollegeFocus(true)}
                onBlur={() => setTimeout(() => setCollegeFocus(false), 150)}
                placeholder="Type your college (e.g. IIT Bombay, Anna University...)"
                className={INPUT_CLS}
                autoComplete="off"
              />
              {collegeFocus && suggestions.length > 0 && (
                <ul
                  data-testid="college-suggestions"
                  className="absolute z-20 mt-1.5 max-h-48 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#111C38] shadow-xl"
                >
                  {suggestions.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        data-testid="college-suggestion"
                        onMouseDown={() => {
                          set("college", c);
                          setCollegeFocus(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-emerald-500/15"
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Branch" error={errors.branch}>
              <Select value={form.branch} onValueChange={(v) => set("branch", v)}>
                <SelectTrigger
                  data-testid="select-branch"
                  className="h-auto rounded-xl border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-50"
                >
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111C38] text-slate-50">
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b} className="text-sm">
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Graduation Year" error={errors.grad_year}>
              <Select value={form.grad_year} onValueChange={(v) => set("grad_year", v)}>
                <SelectTrigger
                  data-testid="select-grad-year"
                  className="h-auto rounded-xl border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-50"
                >
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111C38] text-slate-50">
                  {GRAD_YEARS.map((y) => (
                    <SelectItem key={y} value={y} className="text-sm">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="WhatsApp Number" error={errors.whatsapp_number}>
            <div className="flex items-stretch overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors focus-within:border-emerald-500/60">
              <span className="flex items-center border-r border-white/10 px-3.5 text-sm font-semibold text-slate-400">
                +91
              </span>
              <input
                data-testid="input-whatsapp"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.whatsapp_number}
                onChange={(e) =>
                  set("whatsapp_number", e.target.value.replace(/\D/g, ""))
                }
                placeholder="98765 43210"
                className="w-full bg-transparent px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 outline-none"
              />
            </div>
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              data-testid="input-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="rahul@gmail.com"
              className={INPUT_CLS}
              autoComplete="email"
            />
          </Field>

          {formError && (
            <div
              data-testid="form-error"
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-300"
            >
              {formError}
            </div>
          )}

          <button
            data-testid="submit-registration"
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 text-base font-bold text-[#04101A] shadow-[0_0_28px_rgba(16,185,129,0.3)] transition-colors hover:bg-emerald-400 disabled:opacity-60"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? "Reserving your seat..." : "Reserve My Free Seat"}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-slate-500">
            We'll only use your details for workshop updates. No spam, ever.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
