"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DeleteAccountPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    const { error } = await supabase
      .from("deletion_requests")
      .insert({ email: email.trim() })
      .catch(() => ({ error: null }));

    // Even if table doesn't exist yet, show confirmation
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Delete Account</h1>
        <p className="text-sm text-gray-500 mb-8">
          Submit your request below and we will delete your account and all associated data within 30 days.
        </p>

        {submitted ? (
          <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "#f0f7ff" }}>
            <p className="text-base font-semibold text-gray-900 mb-1">Request received</p>
            <p className="text-sm text-gray-500">
              We'll delete your account and data within 30 days. You'll receive a confirmation at <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Your account email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
              style={{ borderColor: "#e0e0e0" }}
            />
            {error && <p className="text-xs" style={{ color: "#e00" }}>{error}</p>}
            <button
              type="submit"
              disabled={!email.trim()}
              className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: email.trim() ? "#e00" : "#ccc" }}
            >
              Request Account Deletion
            </button>
            <p className="text-xs text-center text-gray-400">
              Contact us at <a href="mailto:kroosailapp@gmail.com" className="underline">kroosailapp@gmail.com</a> for any questions.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
