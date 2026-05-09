"use client";
import { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
  IconUser,
  IconArrowLeft,
  IconSend,
} from "@tabler/icons-react";

const sailors = {
  1: { name: "Andre Peixoto", role: "Jib Trimmer" },
  2: { name: "Sara Lopes", role: "Tactician" },
  3: { name: "Mike Chen", role: "Bowman" },
  4: { name: "Julia Martins", role: "Main Trimmer" },
};

const initialMessages = {
  1: [
    { id: 1, from: "them", text: "Hi! I saw the opening for Jib Trimmer on the Rolex Big Boat Series.", time: "10:02 AM" },
    { id: 2, from: "me", text: "Hey Andre! Yes, we'd love to have you on board. Are you available July 25?", time: "10:05 AM" },
    { id: 3, from: "them", text: "Sounds good, I'll be there!", time: "10:07 AM" },
  ],
  2: [
    { id: 1, from: "them", text: "Hello! I'm interested in the Tactician position.", time: "9:30 AM" },
    { id: 2, from: "me", text: "Hi Sara! We'd love someone with your experience. Can we chat this week?", time: "9:45 AM" },
    { id: 3, from: "them", text: "What time does the race start?", time: "9:50 AM" },
  ],
  3: [
    { id: 1, from: "them", text: "I'm interested in the position.", time: "Mon" },
  ],
  4: [
    { id: 1, from: "me", text: "Hi Julia! We have a Bowman opening you might be interested in.", time: "Yesterday" },
    { id: 2, from: "them", text: "Thanks for the invite!", time: "Yesterday" },
  ],
};

function NavFooter() {
  const items = [
    { label: "Home", href: "/boat/feed", icon: <IconAnchor size={22} /> },
    { label: "Regattas", href: "/boat/regattas", icon: <IconCalendarEvent size={22} /> },
    { label: "Message", href: "/boat/messages", icon: <IconMessage size={22} /> },
    { label: "Favorites", href: "/boat/favorites", icon: <IconStar size={22} /> },
    { label: "Profile", href: "/boat/profile", icon: <IconUser size={22} /> },
  ];
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-center justify-around px-2 pt-2 pb-1 border-t"
      style={{ backgroundColor: "#fff", borderColor: "#e8e8e8" }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-0.5 text-[10px]"
          style={{ color: item.label === "Message" ? "#111" : "#aaa" }}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function BoatChat({ params }) {
  const { id } = use(params);
  const sailor = sailors[id] ?? sailors[1];
  const [messages, setMessages] = useState(initialMessages[id] ?? initialMessages[1]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "me", text, time: "Now" },
    ]);
    setInput("");
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
        <Link href="/boat/messages">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{ width: 36, height: 36, backgroundColor: "#d8d8d8" }}
        >
          <IconUser size={16} color="#aaa" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{sailor.name}</p>
          <p className="text-xs text-gray-400">{sailor.role}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[75%]">
              <div
                className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={{
                  backgroundColor: msg.from === "me" ? "#0161F0" : "#F0F0F0",
                  color: msg.from === "me" ? "#fff" : "#111",
                  borderBottomRightRadius: msg.from === "me" ? 4 : undefined,
                  borderBottomLeftRadius: msg.from === "them" ? 4 : undefined,
                }}
              >
                {msg.text}
              </div>
              <p className={`text-[10px] text-gray-400 mt-1 ${msg.from === "me" ? "text-right" : "text-left"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
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
            style={{
              width: 38, height: 38,
              backgroundColor: input.trim() ? "#0161F0" : "#e0e0e0",
            }}
          >
            <IconSend size={16} color="white" />
          </button>
        </div>
      </div>

      <NavFooter />
    </div>
  );
}
