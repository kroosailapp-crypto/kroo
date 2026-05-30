"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { IconSearch, IconX, IconMessage, IconAnchor, IconTrash } from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
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

function DeleteModal({ name, onConfirm, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-8"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">
          Delete conversation with{" "}
          <span className="text-gray-800">"{name}"</span>?
        </p>
        <p className="text-xs text-gray-400 text-center -mt-2">
          All messages will be permanently deleted for both sides.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold border"
            style={{ color: "#111", borderColor: "#d0d0d0" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#e00" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ConversationRow({ conversation, userId, onDelete }) {
  const { otherId, otherProfile, lastMessage } = conversation;
  const isMe = lastMessage.sender_id === userId;
  const isUnread = !isMe && !lastMessage.read_at;
  const preview = isMe ? `You: ${lastMessage.content}` : lastMessage.content;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Link href={`/crew/messages/${otherId}`} className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{ width: 52, height: 52, backgroundColor: "#e0e0e0" }}
        >
          {otherProfile?.photo_url ? (
            <img src={otherProfile.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <IconAnchor size={22} color="#ccc" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: isUnread ? "#000000" : "#9ca3af" }}
            >
              {otherProfile?.boat_name || "Boat"}
            </p>
            <p className="text-[13px] text-gray-400 flex-shrink-0 ml-2">
              {formatTime(lastMessage.created_at)}
            </p>
          </div>
          <p
            className="text-xs truncate"
            style={{ color: isUnread ? "#111" : "#9ca3af", fontWeight: isUnread ? 700 : undefined }}
          >
            {preview}
          </p>
          {otherProfile?.skipper_name && (
            <p className="text-[13px] text-gray-400 mt-0.5">{otherProfile.skipper_name} · Skipper</p>
          )}
        </div>
      </Link>
      <button
        onClick={() => onDelete(conversation)}
        className="flex-shrink-0 p-2"
      >
        <IconTrash size={16} color="#ccc" />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <IconMessage size={40} color="#e0e0e0" />
      <p className="text-sm font-medium text-gray-400 text-center mt-4">No messages yet</p>
      <p className="text-xs text-gray-400 text-center mt-1">
        When a boat reaches out, conversations will appear here.
      </p>
    </div>
  );
}

export default function CrewMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  async function loadConversations() {
    const [{ data: msgs }, { data: hidden }] = await Promise.all([
      supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false }),
      supabase.from("hidden_conversations").select("other_user_id, hidden_at").eq("user_id", user.id),
    ]);

    const hiddenMap = {};
    for (const h of hidden || []) hiddenMap[h.other_user_id] = h.hidden_at;

    if (!msgs || msgs.length === 0) {
      setLoading(false);
      return;
    }

    const seen = new Set();
    const threads = [];
    for (const msg of msgs) {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        // Only hide if no new message arrived after the user hid it
        const hiddenAt = hiddenMap[otherId];
        if (hiddenAt && new Date(msg.created_at) <= new Date(hiddenAt)) continue;
        threads.push({ otherId, lastMessage: msg });
      }
    }

    const otherIds = threads.map((t) => t.otherId);
    const { data: boatProfiles } = await supabase
      .from("boat_profiles")
      .select("id, boat_name, photo_url, skipper_name")
      .in("id", otherIds);

    const profileMap = {};
    for (const p of boatProfiles || []) profileMap[p.id] = p;

    // For IDs with no boat profile (e.g. admin), try crew_profiles
    const missingIds = otherIds.filter((oid) => !profileMap[oid]);
    if (missingIds.length > 0) {
      const { data: crewFallback } = await supabase
        .from("crew_profiles")
        .select("id, name, avatar_url")
        .in("id", missingIds);
      for (const p of crewFallback || []) {
        profileMap[p.id] = { id: p.id, boat_name: p.name, photo_url: p.avatar_url, skipper_name: null };
      }
    }

    setConversations(
      threads.map((t) => ({ ...t, otherProfile: profileMap[t.otherId] || null }))
    );
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const otherId = deleteTarget.otherId;

    await supabase
      .from("hidden_conversations")
      .upsert({ user_id: user.id, other_user_id: otherId, hidden_at: new Date().toISOString() });

    setConversations((prev) => prev.filter((c) => c.otherId !== otherId));
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.otherProfile?.boat_name || "Boat"}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

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
            placeholder="Search by boat name…"
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
                conv.otherProfile?.boat_name?.toLowerCase().includes(q)
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
              <ConversationRow
                conversation={conv}
                userId={user.id}
                onDelete={setDeleteTarget}
              />
              {i < filtered.length - 1 && <Divider />}
            </div>
          ));
        })()}
      </main>

      <CrewNavFooter active="Message" />
    </div>
  );
}
