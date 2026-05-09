"use client";
import { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconArrowLeft,
  IconSend,
} from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";

const boats = {
  1: { name: "Dilema", skipper: "Linda Petterson", photo: "/boat-image.jpeg" },
  2: { name: "Bravura", skipper: "Carlos Mendes", photo: "/boat-image.jpeg" },
  3: { name: "Wild Card", skipper: "Tom Walsh", photo: "/boat-image.jpeg" },
};

const initialMessages = {
  1: [
    { id: 1, from: "them", text: "Hi! We saw your profile and think you'd be a great fit for our Jib Trimmer position.", time: "10:00 AM" },
    { id: 2, from: "me", text: "Thanks! I'd love to learn more about the regatta.", time: "10:03 AM" },
    { id: 3, from: "them", text: "Hey Andre! Yes, we'd love to have you on board. Are you available July 25?", time: "10:05 AM" },
  ],
  2: [
    { id: 1, from: "them", text: "We reviewed your application. Interested?", time: "9:00 AM" },
    { id: 2, from: "me", text: "Definitely! What position are you looking to fill?", time: "9:10 AM" },
  ],
  3: [
    { id: 1, from: "them", text: "Looking for a strong tactician this season.", time: "Yesterday" },
    { id: 2, from: "me", text: "I've raced Etchells before. Happy to chat!", time: "Yesterday" },
  ],
};

export default function CrewChat({ params }) {
  const { id } = use(params);
  const boat = boats[id] ?? boats[1];
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
        <Link href="/crew/messages">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <div
          className="rounded-xl overflow-hidden flex-shrink-0"
          style={{ width: 36, height: 36, backgroundColor: "#e0e0e0" }}
        >
          <Image src={boat.photo} alt={boat.name} width={36} height={36} className="object-cover w-full h-full" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{boat.name}</p>
          <p className="text-xs text-gray-400">{boat.skipper} · Skipper</p>
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

      <CrewNavFooter active="Message" />
    </div>
  );
}
