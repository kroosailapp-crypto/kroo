"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
    if (error) { setError(error.message); setLoading(false); return; }

    // Check which profiles exist and redirect accordingly
    const userId = data.user.id;
    const [{ data: boatProfile }, { data: crewProfile }] = await Promise.all([
      supabase.from("boat_profiles").select("id").eq("id", userId).single(),
      supabase.from("crew_profiles").select("id").eq("id", userId).single(),
    ]);
    setLoading(false);

    if (boatProfile) router.push("/boat/feed");
    else if (crewProfile) router.push("/crew/feed");
    else router.push("/boat/signup"); // no profile yet — guide them to create one
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-6 pb-10 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-semibold text-gray-900">Log in to your account</p>

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
          className="w-full py-3 rounded-2xl text-sm font-semibold text-white"
          style={{ backgroundColor: !email || !password || loading ? "#ccc" : "#0161f0" }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-[70px] py-[40px]"
      style={{ backgroundColor: "#02123e" }}
    >
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* Logo & Headline */}
      <div className="flex flex-col items-center gap-4 w-full mb-6">
        <p className="text-[20px] font-normal text-center" style={{ color: "#7a9cc4" }}>Welcome to</p>
        <Image
          src="/kroo-finder-white.svg"
          alt="Kroo"
          width={208}
          height={74}
          priority
          className="w-full max-w-[208px]"
        />
      </div>

      {/* Login button */}
      <div className="w-full flex justify-center mb-3">
        <button
          onClick={() => setShowLogin(true)}
          className="w-full lg:w-1/2 flex items-center justify-center px-4 py-2.5 rounded-2xl font-medium text-[20px]"
          style={{ backgroundColor: "#4caf50", color: "#fff" }}
        >
          Log in
        </button>
      </div>

      <p className="text-white text-[18px] font-normal text-center mb-3">or create an account</p>

      {/* Boat owner looking for crew */}
      <div className="w-full flex justify-center mb-4">
        <Link
          href="/boat/signup"
          className="w-full lg:w-1/2 flex items-center justify-center px-4 py-2.5 rounded-2xl font-medium text-[20px]"
          style={{ backgroundColor: "#3b6fd4", color: "#fff" }}
        >
          Looking for Crew
        </Link>
      </div>

      <p className="text-white text-[20px] font-normal text-center mb-4">or</p>

      {/* Sailor looking for a boat */}
      <div className="w-full flex justify-center mb-6">
        <Link
          href="/crew/signup"
          className="w-full lg:w-1/2 flex items-center justify-center px-4 py-2.5 rounded-2xl font-medium text-[20px]"
          style={{ backgroundColor: "#3b6fd4", color: "#fff" }}
        >
          Looking for a Boat to Sail
        </Link>
      </div>

      {/* Dual account info */}
      <div
        className="w-full lg:w-1/2 rounded-2xl px-4 py-4 flex flex-col gap-3"
        style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <p className="text-[18px] font-semibold text-white">You can have both account types.</p>
        <div className="flex flex-col gap-0.5">
          <p className="text-[18px] font-bold text-white">1. Create one first account</p>
          <p className="text-[18px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>Choose either Crew Member or Boat to Sail to get started.</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[18px] font-bold text-white">2. Once logged in</p>
          <p className="text-[18px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>Tap on the Kroo logo to create the other account.</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[18px] font-bold text-white">3. Switching accounts</p>
          <p className="text-[18px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>Just tap the logo to switch between accounts.</p>
        </div>
      </div>
    </div>
  );
}
