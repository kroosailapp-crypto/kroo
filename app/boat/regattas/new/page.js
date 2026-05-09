"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
  IconUser,
  IconSearch,
  IconPlus,
  IconX,
} from "@tabler/icons-react";

function NavFooter() {
  const items = [
    { label: "Home", href: "/boat/feed", icon: <IconAnchor size={22} /> },
    { label: "Regattas", href: "/boat/regattas", icon: <IconCalendarEvent size={22} /> },
    { label: "Message", href: "/boat/messages", icon: <IconMessage size={22} /> },
    { label: "Following", href: "/boat/following", icon: <IconStar size={22} /> },
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
          style={{ color: item.label === "Regattas" ? "#111" : "#aaa" }}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Tag({ label }) {
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
      style={{ backgroundColor: "#E8EDF8", color: "#111" }}
    >
      {label}
    </span>
  );
}

function AddPositionModal({ onAdd, onClose }) {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");

  function handleAdd() {
    if (role.trim()) {
      onAdd({ role: role.trim(), level: level.trim() });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-8 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-base font-semibold text-gray-900">Add position</p>
          <button onClick={onClose}>
            <IconX size={18} color="#999" />
          </button>
        </div>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Position (e.g. Jib Trimmer)"
          className="w-full px-4 py-3.5 rounded-2xl text-sm text-gray-900 border outline-none"
          style={{ borderColor: "#e0e0e0" }}
          autoFocus
        />
        <input
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="Level (e.g. Mid Level – 2–5 years)"
          className="w-full px-4 py-3.5 rounded-2xl text-sm text-gray-900 border outline-none"
          style={{ borderColor: "#e0e0e0" }}
        />
        <button
          onClick={handleAdd}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white mt-1"
          style={{ backgroundColor: "#0161F0" }}
        >
          Add position
        </button>
      </div>
    </div>
  );
}

export default function CreateRegatta() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [website, setWebsite] = useState("");
  const [positions, setPositions] = useState([
    { role: "Mainsail Trimmer", level: "Mid Level – 2–5 years" },
  ]);
  const [showModal, setShowModal] = useState(false);

  function removePosition(index) {
    setPositions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddPosition(pos) {
    setPositions((prev) => [...prev, pos]);
    setShowModal(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {showModal && (
        <AddPositionModal
          onAdd={handleAddPosition}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={52} height={20} />
        <div
          className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-400"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <IconSearch size={14} color="#aaa" />
          <span>Search</span>
        </div>
        <Link href="/boat/regattas/new">
          <IconPlus size={22} color="#111" />
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-28 flex flex-col gap-3">

        {/* Regatta Name */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Regatta name"
          className="w-full px-4 py-3.5 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
          style={{ borderColor: "#e0e0e0" }}
        />

        {/* Location */}
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="w-full px-4 py-3.5 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
          style={{ borderColor: "#e0e0e0" }}
        />

        {/* Date */}
        <div>
          <p className="text-sm text-gray-700 font-medium mb-2">Date</p>
          <div className="flex gap-2">
            <input
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="05"
              maxLength={2}
              inputMode="numeric"
              className="w-16 px-3 py-3.5 rounded-2xl text-sm text-center text-gray-900 border outline-none placeholder-gray-400"
              style={{ borderColor: "#e0e0e0" }}
            />
            <input
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="12"
              maxLength={2}
              inputMode="numeric"
              className="w-16 px-3 py-3.5 rounded-2xl text-sm text-center text-gray-900 border outline-none placeholder-gray-400"
              style={{ borderColor: "#e0e0e0" }}
            />
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2026"
              maxLength={4}
              inputMode="numeric"
              className="w-24 px-3 py-3.5 rounded-2xl text-sm text-center text-gray-900 border outline-none placeholder-gray-400"
              style={{ borderColor: "#e0e0e0" }}
            />
          </div>
        </div>

        {/* Website */}
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Website"
          inputMode="url"
          className="w-full px-4 py-3.5 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
          style={{ borderColor: "#e0e0e0" }}
        />

        {/* Positions */}
        <div className="flex flex-col gap-2 pt-1">
          {positions.map((pos, i) => (
            <div
              key={i}
              className="border rounded-2xl px-4 py-3"
              style={{ borderColor: "#e0e0e0" }}
            >
              <div className="flex items-start justify-between gap-2">
                <Tag label={pos.role} />
                <button onClick={() => removePosition(i)} className="mt-0.5 flex-shrink-0">
                  <IconX size={16} color="#999" />
                </button>
              </div>
              {pos.level && (
                <p className="text-xs text-gray-500 mt-2">{pos.level}</p>
              )}
            </div>
          ))}

          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-medium text-left pt-1"
            style={{ color: "#0161F0" }}
          >
            + Add crew position available
          </button>
        </div>

      </div>

      {/* Save Button */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-3"
        style={{ bottom: "56px" }}
      >
        <button
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: "#0161F0" }}
        >
          Save Regatta
        </button>
      </div>

      <NavFooter />
    </div>
  );
}
