"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function BoatLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/boat/profile");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-5 py-5">
      <div className="mb-8">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={60} height={24} />
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-gray-800 font-semibold text-lg mb-1">Welcome back</p>

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

        {error && (
          <p className="text-xs" style={{ color: "#e00" }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={!email || !password || loading}
          className="flex items-center justify-center px-6 py-3 rounded-full font-medium text-sm mt-2"
          style={{
            backgroundColor: !email || !password || loading ? "#ccc" : "#0161f0",
            color: "#fff",
          }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-2">
          Don't have an account?{" "}
          <Link href="/boat/signup" className="font-medium" style={{ color: "#0161f0" }}>
            Sign up
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="mt-auto pt-8 text-left text-sm"
        style={{ color: "#aaa" }}
      >
        ← Back
      </Link>
    </div>
  );
}
