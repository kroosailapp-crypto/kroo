"use client";
import { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import { IconArrowLeft, IconSend, IconAnchor, IconUser } from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { notify } from "@/lib/notify";

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

export default function CrewChat({ params }) {
  const { id } = use(params); // other user's id (boat owner)
  const { user } = useAuth();
  const [otherProfile, setOtherProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const messagesRef = useRef([]);

  // Load boat profile for header
  useEffect(() => {
    supabase
      .from("boat_profiles")
      .select("boat_name, photo_url, skipper_name")
      .eq("id", id)
      .single()
      .then(({ data }) => setOtherProfile(data));
  }, [id]);

  // Load messages and mark received ones as read
  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      const msgs = data || [];
      setMessages(msgs);
      messagesRef.current = msgs;
      setLoading(false);

      // Mark all unread messages from this sender as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("receiver_id", user.id)
        .eq("sender_id", id)
        .is("read_at", null);
    }
    load();
  }, [user, id]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`chat-crew-${user.id}-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new;
          const isRelevant =
            (msg.sender_id === user.id && msg.receiver_id === id) ||
            (msg.sender_id === id && msg.receiver_id === user.id);
          if (!isRelevant) return;
          const already = messagesRef.current.find((m) => m.id === msg.id);
          if (already) return;
          setMessages((prev) => {
            const updated = [...prev, msg];
            messagesRef.current = updated;
            return updated;
          });
          // Mark incoming message as read immediately since chat is open
          if (msg.sender_id === id && msg.receiver_id === user.id) {
            await supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", msg.id);
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || !user) return;
    setInput("");

    const optimistic = {
      id: `opt-${Date.now()}`,
      sender_id: user.id,
      receiver_id: id,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => {
      const updated = [...prev, optimistic];
      messagesRef.current = updated;
      return updated;
    });

    const { data } = await supabase
      .from("messages")
      .insert({ sender_id: user.id, receiver_id: id, content: text })
      .select()
      .single();

    if (data) {
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === optimistic.id ? data : m));
        messagesRef.current = updated;
        return updated;
      });
      // Notify boat of new message
      notify({
        event: "new_message",
        recipient_id: id,
        profile_type: "boat",
        sender_name: otherProfile?.skipper_name || "A sailor",
        message_preview: text.slice(0, 200),
      });
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0"
        style={{ borderColor: "#e8e8e8" }}
      >
        <Link href="/crew/messages">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <Link href={`/boat/${id}`} className="rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, backgroundColor: "#e0e0e0" }}>
          {otherProfile?.photo_url ? (
            <img src={otherProfile.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <IconAnchor size={16} color="#ccc" />
          )}
        </Link>
        <Link href={`/boat/${id}`} className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {otherProfile?.boat_name || "Boat"}
          </p>
          {otherProfile?.skipper_name && (
            <p className="text-xs text-gray-400">{otherProfile.skipper_name} · Skipper</p>
          )}
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 flex flex-col gap-3">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">
              Start the conversation with {otherProfile?.boat_name || "this boat"}.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%]">
                  <div
                    className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={{
                      backgroundColor: isMe ? "#0161F0" : "#F0F0F0",
                      color: isMe ? "#fff" : "#111",
                      borderBottomRightRadius: isMe ? 4 : undefined,
                      borderBottomLeftRadius: !isMe ? 4 : undefined,
                    }}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[12px] text-gray-400 mt-1 ${isMe ? "text-right" : "text-left"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 border-t"
        style={{ bottom: "56px", backgroundColor: "#fff", borderColor: "#e8e8e8" }}
      >
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Message…"
            className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
            style={{ backgroundColor: "#f0f0f0", color: "#111" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 38, height: 38, backgroundColor: input.trim() ? "#0161F0" : "#e0e0e0" }}
          >
            <IconSend size={16} color="white" />
          </button>
        </div>
      </div>

      <CrewNavFooter active="Message" />
    </div>
  );
}
