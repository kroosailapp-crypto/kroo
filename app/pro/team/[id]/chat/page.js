"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTeam } from "../layout";
import { IconSend, IconHash } from "@tabler/icons-react";

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const { id } = useParams();
  const { member } = useTeam();
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id));
    supabase.from("pro_chat_channels").select("*").eq("team_id", id).order("created_at").then(({ data }) => {
      setChannels(data || []);
      if (data?.length) setActiveChannel(data[0]);
    });
  }, [id]);

  useEffect(() => {
    if (!activeChannel) return;
    supabase.from("pro_chat_messages").select("*").eq("channel_id", activeChannel.id).order("created_at").then(({ data }) => {
      setMessages(data || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    const sub = supabase
      .channel(`chat-${activeChannel.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pro_chat_messages", filter: `channel_id=eq.${activeChannel.id}` },
        (payload) => {
          setMessages(ms => [...ms, payload.new]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        })
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, [activeChannel?.id]);

  async function sendMessage() {
    if (!text.trim() || !activeChannel) return;
    const content = text.trim();
    setText("");
    await supabase.from("pro_chat_messages").insert({
      channel_id: activeChannel.id,
      sender_id: userId,
      sender_name: member.name || member.email,
      content,
    });
  }

  const TYPE_ICON = { general: "💬", shore: "⚓", event: "🏆" };

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen overflow-hidden">
      {/* Channel list */}
      <div className="w-44 md:w-52 border-r flex flex-col flex-shrink-0 bg-white" style={{ borderColor: "#e5e5e5" }}>
        <div className="px-4 py-4 border-b" style={{ borderColor: "#e5e5e5" }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Channels</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left rounded-lg mx-1"
              style={{
                backgroundColor: activeChannel?.id === ch.id ? "#eff6ff" : "transparent",
                color: activeChannel?.id === ch.id ? "#0161f0" : "#555",
                width: "calc(100% - 8px)",
              }}
            >
              <span className="text-sm">{TYPE_ICON[ch.type] || "💬"}</span>
              <span className="text-xs font-medium truncate">{ch.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeChannel ? (
          <>
            <div className="px-4 py-3 border-b bg-white flex items-center gap-2" style={{ borderColor: "#e5e5e5" }}>
              <span className="text-base">{TYPE_ICON[activeChannel.type] || "💬"}</span>
              <p className="font-semibold text-gray-900 text-sm">{activeChannel.name}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((msg, i) => {
                const isOwn = msg.sender_id === userId;
                const showName = !isOwn && (i === 0 || messages[i - 1].sender_id !== msg.sender_id);
                return (
                  <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                    {showName && <p className="text-xs text-gray-400 mb-1 px-1">{msg.sender_name}</p>}
                    <div className="max-w-[75%] flex flex-col gap-0.5">
                      <div
                        className="px-4 py-2.5 rounded-2xl text-sm"
                        style={{
                          backgroundColor: isOwn ? "#0161f0" : "#fff",
                          color: isOwn ? "#fff" : "#1a1a1a",
                          border: isOwn ? "none" : "1px solid #e5e5e5",
                          borderBottomRightRadius: isOwn ? 4 : undefined,
                          borderBottomLeftRadius: !isOwn ? 4 : undefined,
                        }}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-xs text-gray-400 px-1 ${isOwn ? "text-right" : "text-left"}`}>{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-12">No messages yet. Say hello!</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 bg-white border-t flex items-center gap-3" style={{ borderColor: "#e5e5e5" }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={`Message #${activeChannel.name.toLowerCase()}…`}
                className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none border bg-gray-50"
                style={{ borderColor: "#e5e5e5" }}
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: text.trim() ? "#0161f0" : "#e5e5e5" }}
              >
                <IconSend size={18} style={{ color: text.trim() ? "#fff" : "#aaa" }} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">Select a channel</p>
          </div>
        )}
      </div>
    </div>
  );
}
