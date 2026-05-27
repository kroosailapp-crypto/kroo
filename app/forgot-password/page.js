"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && email) handleReset();
  }

  if (sent) {
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
          <p className="text-lg font-semibold text-gray-900 text-center">Check your email</p>
          <p className="text-sm text-gray-500 text-center leading-relaxed max-w-xs">
            We sent a password reset link to{" "}
            <span className="font-semibold text-gray-800">{email}</span>.
            Click the link in the email to set a new password.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-2 text-sm font-medium"
            style={{ color: "#0161f0" }}
          >
            Resend email
          </button>
        </div>
        <Link
          href="/"
          className="mt-auto pt-8 text-left text-sm"
          style={{ color: "#aaa" }}
        >
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-5 py-5">
      <div className="mb-8">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={60} height={24} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="mb-1">
          <p className="text-gray-800 font-semibold text-lg">Forgot password?</p>
          <p className="text-sm text-gray-400 mt-1">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKey}
          inputMode="email"
          autoFocus
          className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border"
          style={{ borderColor: "#e5e5e5" }}
        />

        {error && (
          <p className="text-xs" style={{ color: "#e00" }}>{error}</p>
        )}

        <button
          onClick={handleReset}
          disabled={!email || loading}
          className="flex items-center justify-center px-6 py-3 rounded-full font-medium text-sm mt-2"
          style={{
            backgroundColor: !email || loading ? "#ccc" : "#0161f0",
            color: "#fff",
          }}
        >
          {loading ? "Sending…" : "Send Reset Link"}
        </button>
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
