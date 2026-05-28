"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { IconSearch, IconX, IconMessage, IconUser } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function ConversationRow({ conversation, userId }) {
  const { otherId, otherProfile, lastMessage } = conversation;
  const isMe = lastMessage.sender_id === userId;
  const preview = isMe ? `You: ${lastMessage.content}` : lastMessage.content;

  return (
    <Link href={`/boat/messages/${otherId}`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{ width: 52, height: 52, backgroundColor: "#d8d8d8" }}
        >
          {otherProfile?.avatar_url ? (
            <img src={otherProfile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <IconUser size={22} color="#aaa" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {otherProfile?.name || "Sailor"}
            </p>
            <p className="text-[13px] text-gray-400 flex-shrink-0 ml-2">
              {formatTime(lastMessage.created_at)}
            </p>
          </div>
          <p className="text-xs text-gray-500 truncate">{preview}</p>
          {otherProfile?.positions?.[0] && (
            <p className="text-[13px] text-gray-400 mt-0.5">{otherProfile.positions[0]}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconMessage size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No messages yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">
        When you message a sailor, conversations will appear here.
      </p>
    </div>
  );
}

export default function BoatMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  async function loadConversations() {
    // Get all messages involving current user, latest first
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!msgs || msgs.length === 0) {
      setLoading(false);
      return;
    }

    // Group by conversation partner (keep only the latest message per partner)
    const seen = new Set();
    const threads = [];
    for (const msg of msgs) {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        threads.push({ otherId, lastMessage: msg });
      }
    }

    // Load crew profiles for all conversation partners
    const otherIds = threads.map((t) => t.otherId);
    const { data: profiles } = await supabase
      .from("crew_profiles")
      .select("id, name, avatar_url, positions")
      .in("id", otherIds);

    const profileMap = {};
    for (const p of profiles || []) profileMap[p.id] = p;

    setConversations(
      threads.map((t) => ({ ...t, otherProfile: profileMap[t.otherId] || null }))
    );
    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        <ProfileSwitcher />
        <div
          className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#f0f0f0" }}
          onClick={() => inputRef.current?.focus()}
        >
          <IconSearch size={14} color="#aaa" className="flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400 min-w-0"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <IconX size={13} color="#aaa" />
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        {(() => {
          const q = query.toLowerCase().trim();
          const filtered = q
            ? conversations.filter((conv) =>
                conv.otherProfile?.name?.toLowerCase().includes(q)
              )
            : conversations;
          if (loading) return (
            <div className="flex items-center justify-center py-24">
              <p className="text-sm text-gray-400">Loading…</p>
            </div>
          );
          if (filtered.length === 0) return <EmptyState />;
          return filtered.map((conv, i) => (
            <div key={conv.otherId}>
              <ConversationRow conversation={conv} userId={user.id} />
              {i < filtered.length - 1 && <Divider />}
            </div>
          ));
        })()}
      </main>

      <BoatNavFooter active="Message" />
    </div>
  );
}
