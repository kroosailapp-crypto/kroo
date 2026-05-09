"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  IconSearch,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";

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

const POSITIONS = [
  "Helm",
  "Tactician",
  "Navigator",
  "Mainsail Trimmer",
  "Jib Trimmer",
  "Spin Trimmer",
  "Bowman",
  "Foredeck",
  "Pitman",
  "Grinder",
  "Mast",
  "Runner",
];

const LEVELS = [
  "All levels",
  "Entry Level",
  "Mid Level – 2–5 years",
  "Advanced",
];

function AddPositionModal({ onAdd, onClose }) {
  const [role, setRole] = useState(null);
  const [level, setLevel] = useState(null);

  function handleAdd() {
    if (role) {
      onAdd({ role, level: level ?? "" });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-8 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Add position</p>
          <button onClick={onClose}>
            <IconX size={18} color="#999" />
          </button>
        </div>

        {/* Position list */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Position</p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <button
                key={p}
                onClick={() => setRole(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={{
                  backgroundColor: role === p ? "#111" : "#F4F4F4",
                  color: role === p ? "#fff" : "#111",
                  borderColor: role === p ? "#111" : "#F4F4F4",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Level list */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Level</p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={{
                  backgroundColor: level === l ? "#111" : "#F4F4F4",
                  color: level === l ? "#fff" : "#111",
                  borderColor: level === l ? "#111" : "#F4F4F4",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={!role}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white mt-1"
          style={{ backgroundColor: role ? "#0161F0" : "#c0c0c0" }}
        >
          Add position
        </button>
      </div>
    </div>
  );
}

export default function CreateRegatta() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [website, setWebsite] = useState("");
  const [positions, setPositions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  function removePosition(index) {
    setPositions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddPosition(pos) {
    setPositions((prev) => [...prev, pos]);
    setShowModal(false);
  }

  function handleSave() {
    if (!name.trim()) return;
    const newRegatta = {
      id: Date.now(),
      name: name.trim(),
      date: [month, day, year].filter(Boolean).join("/") || "TBD",
      location: location.trim() || "TBD",
      website: website.trim(),
      invited: 0,
      confirmed: 0,
      pending: 0,
      declined: 0,
      positions: positions.map((p, i) => ({
        id: i + 1,
        role: p.role,
        level: p.level,
        status: "open",
        crew: null,
        applicants: 0,
      })),
    };
    const existing = JSON.parse(localStorage.getItem("kroo_extra_regattas") || "[]");
    localStorage.setItem("kroo_extra_regattas", JSON.stringify([...existing, newRegatta]));
    router.push("/boat/regattas");
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
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: name.trim() ? "#0161F0" : "#c0c0c0" }}
        >
          Save Regatta
        </button>
      </div>

      <BoatNavFooter active="Regattas" />
    </div>
  );
}
