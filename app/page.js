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
    setLoading(false);
    if (error) { setError(error.message); return; }
    const userType = data.user?.user_metadata?.user_type;
    router.push(userType === "boat" ? "/boat/profile" : "/crew/profile");
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

export default function WelcomePage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-[70px] py-[40px]"
      style={{ backgroundColor: "#02123e" }}
    >
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* Logo & Headline */}
      <div className="flex flex-col items-center gap-12 w-full mb-8">
        <p className="text-white text-2xl font-normal text-center">Welcome to</p>
        <Image
          src="/kroo-logo-white.svg"
          alt="Kroo"
          width={260}
          height={93}
          priority
          className="w-full max-w-[260px]"
        />
        <p className="text-white text-2xl font-normal text-center">Are you looking for</p>
      </div>

      {/* Boat owner looking for crew */}
      <Link
        href="/boat/signup"
        className="w-full flex items-center justify-center px-4 py-2 rounded-full mb-6 font-medium text-sm tracking-wide"
        style={{ backgroundColor: "#0161f0", color: "#f6f6f6" }}
      >
        CREW MEMBER
      </Link>

      <p className="text-white text-2xl font-normal text-center mb-6">Or</p>

      {/* Sailor looking for a boat */}
      <Link
        href="/crew/signup"
        className="w-full flex items-center justify-center px-4 py-2 rounded-full font-medium text-sm tracking-wide"
        style={{ backgroundColor: "#0161f0", color: "#f6f6f6" }}
      >
        A BOAT TO SAIL
      </Link>

      {/* Login link */}
      <button
        onClick={() => setShowLogin(true)}
        className="mt-10 text-sm font-medium"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        Already have an account? <span style={{ color: "#fff" }}>Log in</span>
      </button>
    </div>
  );
}
