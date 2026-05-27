"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import LocationInput from "@/app/components/LocationInput";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

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
  "Foredeck",
  "Bow",
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
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [yachtClub, setYachtClub] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [website, setWebsite] = useState("");
  const [positions, setPositions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function removePosition(index) {
    setPositions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddPosition(pos) {
    setPositions((prev) => [...prev, pos]);
    setShowModal(false);
  }

  async function handleSave() {
    if (!name.trim() || !user) return;
    setSaving(true);
    setError("");

    const date = [month, day, year].filter(Boolean).join("/") || null;

    // 1. Insert regatta
    const { data: regatta, error: regattaError } = await supabase
      .from("regattas")
      .insert({ boat_id: user.id, name: name.trim(), date, location: location.trim() || null, yacht_club: yachtClub.trim() || null })
      .select()
      .single();

    if (regattaError) {
      setError("Failed to save regatta: " + regattaError.message);
      setSaving(false);
      return;
    }

    // 2. Insert positions
    if (positions.length > 0) {
      const { error: posError } = await supabase.from("regatta_positions").insert(
        positions.map((p) => ({ regatta_id: regatta.id, role: p.role, level: p.level, status: "open" }))
      );
      if (posError) {
        setError("Regatta saved but positions failed: " + posError.message);
        setSaving(false);
        return;
      }
    }

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
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
        <Link href="/boat/regattas"><IconArrowLeft size={22} color="#111" /></Link>
        <p className="flex-1 text-sm font-semibold text-gray-900">New Regatta</p>
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
        <LocationInput
          value={location}
          onChange={setLocation}
          placeholder="Location"
          className="w-full px-4 py-3.5 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
          style={{ borderColor: "#e0e0e0" }}
        />

        {/* Yacht Club */}
        <input
          value={yachtClub}
          onChange={(e) => setYachtClub(e.target.value)}
          placeholder="Yacht Club"
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
        {error && <p className="text-xs text-center mb-2" style={{ color: "#e00" }}>{error}</p>}
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: name.trim() && !saving ? "#0161F0" : "#c0c0c0" }}
        >
          {saving ? "Saving…" : "Save Regatta"}
        </button>
      </div>

      <BoatNavFooter active="Regattas" />
    </div>
  );
}
