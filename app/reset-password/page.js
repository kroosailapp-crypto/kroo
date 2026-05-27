"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCheck, IconEye, IconEyeOff } from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when user arrives via the reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        readyRef.current = true;
        setReady(true);
      }
    });

    // Also check if already has a session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        readyRef.current = true;
        setReady(true);
      }
    });

    // If no recovery event fires within 3s, the link is likely expired/invalid
    // Use a ref to avoid stale closure over the `ready` state value
    const timeout = setTimeout(() => {
      if (!readyRef.current) setExpired(true);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleUpdate() {
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/"), 2500);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && password && confirm) handleUpdate();
  }

  // ── Success ──
  if (done) {
    return (
      <div className="flex flex-col min-h-screen bg-white px-5 py-5">
        <div className="mb-8">
          <Image src="/kroo-logo-blue.svg" alt="Kroo" width={60} height={24} />
        </div>
        <div className="flex flex-col items-center gap-4 mt-16">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 56, height: 56, backgroundColor: "#111" }}
          >
            <IconCheck size={26} color="white" strokeWidth={2.5} />
          </div>
          <p className="text-lg font-semibold text-gray-900">Password updated!</p>
          <p className="text-sm text-gray-400 text-center">Redirecting you to login…</p>
        </div>
      </div>
    );
  }

  // ── Expired / invalid link ──
  if (expired && !ready) {
    return (
      <div className="flex flex-col min-h-screen bg-white px-5 py-5">
        <div className="mb-8">
          <Image src="/kroo-logo-blue.svg" alt="Kroo" width={60} height={24} />
        </div>
        <div className="flex flex-col gap-4 mt-8">
          <p className="text-gray-800 font-semibold text-lg">Link expired</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            This reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="flex items-center justify-center px-6 py-3 rounded-full font-medium text-sm text-white"
            style={{ backgroundColor: "#0161f0" }}
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading (waiting for recovery event) ──
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-400">Verifying link…</p>
      </div>
    );
  }

  // ── Set new password form ──
  return (
    <div className="flex flex-col min-h-screen bg-white px-5 py-5">
      <div className="mb-8">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={60} height={24} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="mb-1">
          <p className="text-gray-800 font-semibold text-lg">Set new password</p>
          <p className="text-sm text-gray-400 mt-1">Choose a strong password for your account.</p>
        </div>

        {/* New password */}
        <div
          className="flex items-center border rounded-xl px-4"
          style={{ borderColor: "#e5e5e5" }}
        >
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 py-3 text-sm text-gray-800 outline-none bg-transparent"
          />
          <button onClick={() => setShowPassword((v) => !v)} className="flex-shrink-0 ml-2">
            {showPassword
              ? <IconEyeOff size={16} color="#aaa" />
              : <IconEye size={16} color="#aaa" />}
          </button>
        </div>

        {/* Confirm password */}
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onKeyDown={handleKey}
          className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border"
          style={{ borderColor: "#e5e5e5" }}
        />

        {error && (
          <p className="text-xs" style={{ color: "#e00" }}>{error}</p>
        )}

        <button
          onClick={handleUpdate}
          disabled={!password || !confirm || loading}
          className="flex items-center justify-center px-6 py-3 rounded-full font-medium text-sm mt-2"
          style={{
            backgroundColor: !password || !confirm || loading ? "#ccc" : "#0161f0",
            color: "#fff",
          }}
        >
          {loading ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}
