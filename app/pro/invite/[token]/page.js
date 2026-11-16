"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function InviteAcceptPage() {
  const { token } = useParams();
  const router = useRouter();
  const [invite, setInvite] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("review"); // review | signup | done
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: inv } = await supabase.from("pro_invitations").select("*, pro_teams(*)").eq("token", token).single();
      if (!inv || inv.accepted_at) { setLoading(false); return; }
      setInvite(inv);
      setTeam(inv.pro_teams);
      setLoading(false);
    }
    load();
  }, [token]);

  async function handleAccept() {
    setError("");
    setSubmitting(true);

    // Check if user already exists
    const { data: { user: existingUser } } = await supabase.auth.getUser();

    let userId;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new account
      const { data, error: authErr } = await supabase.auth.signUp({ email: invite.email, password });
      if (authErr) { setError(authErr.message); setSubmitting(false); return; }
      userId = data.user.id;
    }

    // Add to team
    const { error: memberErr } = await supabase.from("pro_team_members").insert({
      team_id: invite.team_id,
      user_id: userId,
      role: invite.role,
      name: name || null,
      email: invite.email,
    });
    if (memberErr && !memberErr.message.includes("duplicate")) {
      setError(memberErr.message); setSubmitting(false); return;
    }

    // Mark invite accepted
    await supabase.from("pro_invitations").update({ accepted_at: new Date().toISOString() }).eq("token", token);

    router.push(`/pro/team/${invite.team_id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f6f6f6" }}>
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: "#f6f6f6" }}>
        <p className="text-gray-500 text-center">This invitation is invalid or has already been used.</p>
      </div>
    );
  }

  const ROLE_LABEL = { manager: "Manager", sailor: "Sailor", shore_crew: "Shore Crew" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: "#02123e" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image src="/kroo-finder-white.svg" alt="Kroo" width={140} height={50} className="w-36" />
          <span className="text-xs font-semibold tracking-widest uppercase px-2 py-0.5 rounded-md" style={{ backgroundColor: "#39e75f", color: "#02123e" }}>Pro</span>
        </div>

        <div className="bg-white rounded-2xl p-6 flex flex-col gap-5">
          {team?.photo_url && <img src={team.photo_url} alt={team.name} className="w-16 h-16 rounded-xl object-cover mx-auto" />}
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{team?.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              You've been invited to join as <strong>{ROLE_LABEL[invite.role]}</strong>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border"
              style={{ borderColor: "#e5e5e5" }}
            />
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border"
              style={{ borderColor: "#e5e5e5" }}
            />
          </div>

          {error && <p className="text-xs" style={{ color: "#e00" }}>{error}</p>}

          <button
            onClick={handleAccept}
            disabled={!password || submitting}
            className="w-full py-3 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: !password || submitting ? "#ccc" : "#0161f0" }}
          >
            {submitting ? "Joining…" : "Join team"}
          </button>

          <p className="text-xs text-center text-gray-400">
            Invitation sent to <strong>{invite.email}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
