"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { useHydrateStore } from "@/lib/use-hydrate-store";
import { MOCK_USERS, DEMO_CREDENTIALS } from "@/lib/mock-data";
import {
  Eye, EyeOff, GraduationCap, Lock, Mail, ChevronRight,
  BookOpen, BarChart3, Users, FileText,
} from "lucide-react";

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  DEPARTMENT_HEAD: "bg-blue-100 text-blue-700 border-blue-200",
  FACULTY: "bg-green-100 text-green-700 border-green-200",
  REVIEWER: "bg-orange-100 text-orange-700 border-orange-200",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  DEPARTMENT_HEAD: "Dept. Head",
  FACULTY: "Faculty",
  REVIEWER: "Reviewer",
};

const features = [
  { icon: BarChart3, title: "KPI Analytics", desc: "Track department performance with live charts" },
  { icon: FileText, title: "Report Generation", desc: "Auto-generate annual reports from collected data" },
  { icon: Users, title: "Multi-role Access", desc: "Role-based views for Admin, HOD, Faculty & Reviewer" },
  { icon: BookOpen, title: "Data Collection", desc: "Structured metric entry with approval workflows" },
];

export default function LoginPage() {
  useHydrateStore();
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const currentUser = useAppStore((s) => s.currentUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const cred = DEMO_CREDENTIALS.find(
      (c) => c.email === email.trim() && c.password === password
    );
    if (!cred) {
      toast.error("Invalid credentials", { description: "Check your email and password." });
      setLoading(false);
      return;
    }
    const user = MOCK_USERS.find((u) => u.email === cred.email)!;
    login(user);
    toast.success(`Welcome back, ${user.name.split(" ")[0]}!`, {
      description: `Logged in as ${roleLabels[user.role]}`,
    });
    router.push("/dashboard");
  };

  const quickLogin = async (cred: (typeof DEMO_CREDENTIALS)[number]) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const user = MOCK_USERS.find((u) => u.email === cred.email)!;
    login(user);
    toast.success(`Welcome, ${user.name.split(" ")[0]}!`, {
      description: `Signed in as ${roleLabels[user.role]}`,
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Left hero panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-indigo-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CampusChronicle</h1>
              <p className="text-xs text-white/60">Annual Report Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold leading-tight mb-4 text-balance">
              Sri Ramakrishna Engineering College
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Coimbatore, Tamil Nadu — Streamlining annual academic reporting for all departments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-4 rounded-xl bg-indigo-800/40">
                <div className="w-8 h-8 rounded-lg bg-indigo-400/30 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs relative z-10">
          {String.fromCharCode(169)} 2024 SREC Coimbatore. All rights reserved.
        </p>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">CampusChronicle</h1>
              <p className="text-xs text-slate-500">Annual Report Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
            <p className="text-slate-600 text-sm">{"Welcome back to SREC's report portal"}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@srec.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick access */}
          <div className="mt-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-2 text-slate-500 font-medium">Demo quick access</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  onClick={() => quickLogin(cred)}
                  disabled={loading}
                  className="flex flex-col items-start gap-1 p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-slate-900">
                      {cred.name.split(" ")[0]}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${roleColors[cred.role]}`}>
                      {roleLabels[cred.role]}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate w-full">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
