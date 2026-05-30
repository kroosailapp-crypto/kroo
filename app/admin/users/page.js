"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconSearch, IconX, IconUser, IconAnchor } from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

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
          width: 44, height: 44, backgroundColor: "#e0e0e0",
          borderRadius: user.type === "crew" ? "50%" : "10px",
        }}
      >
        {(user.avatar_url || user.photo_url)
          ? <img src={user.avatar_url || user.photo_url} alt="" className="w-full h-full object-cover" />
          : user.type === "crew" ? <IconUser size={18} color="#aaa" /> : <IconAnchor size={18} color="#aaa" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{name || "—"}</p>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: user.type === "crew" ? "#EEF4FF" : "#E8EDF8", color: "#0161F0" }}>
            {user.type}
          </span>
          {user.banned && <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#FFF0F0", color: "#e00" }}>suspended</span>}
        </div>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
        {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
      </div>
      <div className="flex flex-col gap-1.5 flex-shrink-0">
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

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [query, setQuery] = useState("");
  const [crew, setCrew] = useState([]);
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("crew");
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const t = session?.access_token;
      setToken(t);
      const { data: isAdmin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!isAdmin) { router.push("/"); return; }
      setAuthorized(true);
      fetchUsers(t, "");
    }
    init();
  }, [user]);

  async function fetchUsers(t, q) {
    setLoading(true);
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${t || token}` },
    });
    const data = await res.json();
    setCrew(data.crew || []);
    setBoats(data.boats || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!authorized || !token) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(token, query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, authorized]);

  if (!authorized) return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>;

  const list = tab === "crew" ? crew : boats;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
        <Link href="/admin"><IconArrowLeft size={22} color="#111" /></Link>
        <p className="text-sm font-semibold text-gray-900 flex-1">All Users</p>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl" style={{ backgroundColor: "#f0f0f0" }}>
          <IconSearch size={14} color="#aaa" className="flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or location…"
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 min-w-0"
          />
          {query && <button onClick={() => setQuery("")}><IconX size={13} color="#aaa" /></button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-3 pb-2">
        {["crew", "boats"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-sm font-semibold pb-1 border-b-2"
            style={{ borderColor: tab === t ? "#0161F0" : "transparent", color: tab === t ? "#0161F0" : "#aaa" }}
          >
            {t === "crew" ? `Crew (${crew.length})` : `Boats (${boats.length})`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No users found.</p>
        ) : (
          list.map((u) => <UserRow key={u.id} user={u} token={token} onUpdate={() => fetchUsers(token, query)} />)
        )}
      </div>
    </div>
  );
}
