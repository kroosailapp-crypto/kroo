"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { loginErrorMessage } from "@/lib/login-error";

function LoginModal({ onClose }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(loginErrorMessage(error)); setLoading(false); return; }

    const { data: membership } = await supabase
      .from("pro_team_members")
      .select("team_id")
      .eq("user_id", data.user.id)
      .limit(1)
      .single();

    setLoading(false);
    if (membership) router.push(`/pro/team/${membership.team_id}`);
    else router.push("/pro/signup");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-lg px-5 pt-6 pb-10 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-semibold text-gray-900">Log in to Kroo Pro</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputMode="email"
          className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border"
          style={{ borderColor: "#e5e5e5" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border"
          style={{ borderColor: "#e5e5e5" }}
        />
        <div className="flex justify-end -mt-2">
          <Link href="/forgot-password" onClick={onClose} className="text-xs" style={{ color: "#0161f0" }}>
            Forgot password?
          </Link>
        </div>
        {error && <p className="text-xs" style={{ color: "#e00" }}>{error}</p>}
        <button
          onClick={handleLogin}
          disabled={!email || !password || loading}
          className="w-full py-3 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: !email || !password || loading ? "#ccc" : "#0161f0" }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </div>
    </div>
  );
}

export default function ProWelcomePage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-8 py-12"
      style={{ backgroundColor: "#02123e" }}
    >
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <div className="flex flex-col items-center gap-10 w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <Image src="/kroo-finder-white.svg" alt="Kroo" width={180} height={64} priority className="w-44" />
          <span
            className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-md"
            style={{ backgroundColor: "#39e75f", color: "#02123e" }}
          >
            Pro
          </span>
        </div>

        <p className="text-white text-xl font-normal text-center">
          Professional sailing team management
        </p>

        <div className="flex flex-col gap-4 w-full mt-4">
          <Link
            href="/pro/signup"
            className="w-full flex items-center justify-center px-4 py-3 rounded-full font-semibold text-sm tracking-wide"
            style={{ backgroundColor: "#0161f0", color: "#fff" }}
          >
            CREATE YOUR TEAM
          </Link>
          <button
            onClick={() => setShowLogin(true)}
            className="w-full flex items-center justify-center px-4 py-3 rounded-full font-semibold text-sm tracking-wide border"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
          >
            LOG IN
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-6">
          {[
            { icon: "👥", label: "Roster management" },
            { icon: "📅", label: "Event scheduling" },
            { icon: "⚙️", label: "Maintenance tracking" },
            { icon: "💬", label: "Team chat" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
              <span className="text-lg">{icon}</span>
              <span className="text-xs text-white font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-12 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
        Part of the Kroo ecosystem
      </p>
    </div>
  );
}
