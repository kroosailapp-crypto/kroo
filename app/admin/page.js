"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconSearch, IconX, IconUsers, IconAnchor, IconCalendar, IconUser, IconMessage } from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

function StatCard({ label, value, color }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-2xl" style={{ backgroundColor: "#f6f6f6" }}>
      <p className="text-2xl font-bold" style={{ color: color || "#111" }}>{value ?? "—"}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function UserRow({ user, token, onUpdate }) {
  const [loading, setLoading] = useState(false);

  async function handleSuspend() {
    setLoading(true);
    await fetch("/api/admin/suspend", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: user.id, suspend: !user.banned }),
    });
    onUpdate();
    setLoading(false);
  }

  async function handleRemove() {
    if (!confirm(`Remove ${user.name || user.boat_name}? This cannot be undone.`)) return;
    setLoading(true);
    await fetch("/api/admin/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: user.id }),
    });
    onUpdate();
    setLoading(false);
  }

  const name = user.type === "crew" ? user.name : user.boat_name;
  const sub = user.type === "crew" ? user.location : user.skipper_name;

  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: "#f0f0f0" }}>
      <div
        className="flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{
          width: 40, height: 40, backgroundColor: "#e0e0e0",
          borderRadius: user.type === "crew" ? "50%" : "10px",
        }}
      >
        {(user.avatar_url || user.photo_url)
          ? <img src={user.avatar_url || user.photo_url} alt="" className="w-full h-full object-cover" />
          : user.type === "crew" ? <IconUser size={16} color="#aaa" /> : <IconAnchor size={16} color="#aaa" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{name || "—"}</p>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: user.type === "crew" ? "#EEF4FF" : "#E8EDF8", color: "#0161F0" }}>
            {user.type}
          </span>
          {user.banned && <span className="text-[11px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#FFF0F0", color: "#e00" }}>suspended</span>}
        </div>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
        {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleSuspend}
          disabled={loading}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full border"
          style={{ color: user.banned ? "#0161F0" : "#f59e0b", borderColor: user.banned ? "#0161F0" : "#f59e0b" }}
        >
          {user.banned ? "Unsuspend" : "Suspend"}
        </button>
        <button
          onClick={handleRemove}
          disabled={loading}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full border"
          style={{ color: "#e00", borderColor: "#fca5a5" }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const t = session?.access_token;
      setToken(t);

      // Check admin
      const { data: isAdmin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!isAdmin) { router.push("/"); return; }
      setAuthorized(true);

      // Load stats
      const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      setStats(data);
    }
    init();
  }, [user]);

  useEffect(() => {
    if (!token || !authorized) return;
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults(null); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResults([...(data.crew || []), ...(data.boats || [])]);
      setSearching(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, token, authorized]);

  async function refresh() {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setResults([...(data.crew || []), ...(data.boats || [])]);
    const sRes = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
    setStats(await sRes.json());
  }

  if (!authorized) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ backgroundColor: "#111" }}>
        <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: "#0161F0" }}>KROO</p>
        <p className="text-xl font-bold text-white mb-4">Admin Dashboard</p>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl" style={{ backgroundColor: "#222" }}>
          <IconSearch size={15} color="#666" className="flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crew or boat users…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-600 min-w-0"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults(null); }}>
              <IconX size={14} color="#666" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Search results */}
        {query.trim() ? (
          <div>
            <p className="text-xs text-gray-400 mb-3">
              {searching ? "Searching…" : `${results?.length || 0} results`}
            </p>
            {(results || []).map((u) => (
              <UserRow key={u.id} user={u} token={token} onUpdate={refresh} />
            ))}
          </div>
        ) : (
          <>
            {/* Stats */}
            <p className="text-xs text-gray-400 mb-3">Overview</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <StatCard label="Crew Accounts" value={stats?.crewCount} color="#0161F0" />
              <StatCard label="Boat Accounts" value={stats?.boatCount} color="#111" />
              <StatCard label="Active Regattas" value={stats?.regattaCount} color="#0161F0" />
              <StatCard label="Open Positions" value={stats?.openCount} color="#f59e0b" />
              <StatCard label="Filled Positions" value={stats?.filledCount} color="#22c55e" />
            </div>

            {/* Quick links */}
            <p className="text-xs text-gray-400 mb-3">Tools</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-4 py-4 rounded-2xl"
                style={{ backgroundColor: "#f6f6f6" }}
              >
                <IconUsers size={20} color="#0161F0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">All Users</p>
                  <p className="text-xs text-gray-400">Browse, suspend or remove accounts</p>
                </div>
              </Link>
              <Link
                href="/admin/messages"
                className="flex items-center gap-3 px-4 py-4 rounded-2xl"
                style={{ backgroundColor: "#f6f6f6" }}
              >
                <IconMessage size={20} color="#0161F0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Message Center</p>
                  <p className="text-xs text-gray-400">Broadcast to all crew or all boats</p>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
