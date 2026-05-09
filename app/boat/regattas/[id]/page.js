"use client";
import { useState, use } from "react";
import Link from "next/link";
import {
  IconMessage,
  IconStar,
  IconUser,
  IconArrowLeft,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";

const POSITIONS = [
  "Helm",
  "Tactician",
  "Navigator",
  "Mainsail Trimmer",
  "Jib Trimmer",
  "Spin Trimmer",
  "Bow",
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

const regattas = {
  1: {
    id: 1,
    name: "Rolex Big Boat Series",
    date: "07/25/2026",
    location: "San Francisco, CA",
    invited: 5,
    confirmed: 2,
    pending: 2,
    declined: 1,
    positions: [
      {
        id: 1,
        role: "Jib Trimmer",
        level: "Mid Level – 2–5 years",
        status: "filled",
        selectedCrew: { id: 1, name: "Andre Peixoto", location: "San Francisco, CA" },
        otherApplicants: [
          { id: 2, name: "Sara Lopes", level: "Advanced" },
          { id: 3, name: "Mike Chen", level: "Entry Level" },
        ],
      },
      {
        id: 2,
        role: "Bow",
        level: "All levels",
        status: "open",
        selectedCrew: null,
        otherApplicants: [
          { id: 4, name: "Julia Martins", level: "Mid-Level" },
          { id: 5, name: "Tom Walsh", level: "Advanced" },
          { id: 6, name: "Carlos Mendes", level: "Mid-Level" },
          { id: 7, name: "Linda Petterson", level: "Advanced" },
        ],
      },
      {
        id: 3,
        role: "Spin Trimmer",
        level: "Mid Level – 2–5 years",
        status: "open",
        selectedCrew: null,
        otherApplicants: [],
      },
    ],
  },
  2: {
    id: 2,
    name: "Bay Regatta",
    date: "08/10/2026",
    location: "Oakland, CA",
    invited: 2,
    confirmed: 1,
    pending: 1,
    declined: 0,
    positions: [
      {
        id: 1,
        role: "Tactician",
        level: "Advanced",
        status: "open",
        selectedCrew: null,
        otherApplicants: [
          { id: 2, name: "Sara Lopes", level: "Advanced" },
          { id: 1, name: "Andre Peixoto", level: "Mid-Level" },
        ],
      },
    ],
  },
};

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
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

function CrewRow({ crew, action }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b" style={{ borderColor: "#e8e8e8" }}>
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{ width: 42, height: 42, backgroundColor: "#d8d8d8" }}
      >
        <IconUser size={18} color="#aaa" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{crew.name}</p>
        <p className="text-xs text-gray-400">{crew.level}</p>
        {action && (
          <div className="flex items-center gap-3 mt-1.5">
            {action}
          </div>
        )}
      </div>
      <IconStar size={18} color="#ccc" />
    </div>
  );
}

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

export default function RegattaDetail({ params }) {
  const { id } = use(params);
  const base = regattas[id] ?? regattas[1];
  const [positions, setPositions] = useState(base.positions);
  const [showModal, setShowModal] = useState(false);
  const [collapsedOthers, setCollapsedOthers] = useState({});

  function toggleOthers(posId) {
    setCollapsedOthers((prev) => ({ ...prev, [posId]: !prev[posId] }));
  }

  function handleAddPosition({ role, level }) {
    setPositions((prev) => [
      ...prev,
      {
        id: Date.now(),
        role,
        level,
        status: "open",
        selectedCrew: null,
        otherApplicants: [],
      },
    ]);
    setShowModal(false);
  }

  function handleDeletePosition(posId) {
    setPositions((prev) => prev.filter((p) => p.id !== posId));
  }

  function handleSelectCrew(posId, crew) {
    setPositions((prev) =>
      prev.map((p) =>
        p.id === posId
          ? {
              ...p,
              status: "filled",
              selectedCrew: { id: crew.id, name: crew.name, location: crew.level },
              otherApplicants: p.otherApplicants.filter((a) => a.name !== crew.name),
            }
          : p
      )
    );
    localStorage.setItem("kroo_crew_regatta_notif", "1");
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
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href="/boat/regattas">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <p className="text-sm font-medium text-gray-800">Boat Name</p>
      </div>

      <div className="overflow-y-auto flex-1">

        {/* Boat identifier */}
        <div className="flex items-center gap-3 px-4 pb-3">
          <div
            className="rounded-xl flex-shrink-0"
            style={{ width: 36, height: 36, backgroundColor: "#e0e0e0" }}
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">Boat Name</p>
            <p className="text-xs text-gray-400">San Francisco, CA</p>
          </div>
        </div>

        <Divider />

        {/* Regatta name + date */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs text-gray-400 mb-0.5">{base.date}, {base.location}</p>
          <p className="text-xl font-bold text-gray-900 mb-4">{base.name}</p>

          {/* Stats */}
          <div className="flex gap-5">
            <div>
              <p className="text-base font-semibold text-gray-900">{base.invited}</p>
              <p className="text-[11px] text-gray-500">Invited</p>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{base.confirmed}</p>
              <p className="text-[11px] text-gray-500">Confirmed</p>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{base.pending}</p>
              <p className="text-[11px] text-gray-500">Pending</p>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{base.declined}</p>
              <p className="text-[11px] text-gray-500">Declined</p>
            </div>
          </div>
        </div>

        <Divider />

        {/* Positions */}
        {positions.map((pos) => (
          <div key={pos.id}>
            {/* Position header */}
            <div className="flex items-center gap-2 px-4 py-3">
              <Tag label={pos.role} />
              <span className="text-xs text-gray-500 flex-1">{pos.level}</span>
              {pos.status === "filled" && (
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: 22, height: 22, backgroundColor: "#111" }}
                >
                  <IconCheck size={13} color="white" strokeWidth={2.5} />
                </div>
              )}
              <button onClick={() => handleDeletePosition(pos.id)} className="flex-shrink-0 ml-1">
                <IconX size={16} color="#bbb" />
              </button>
            </div>

            {/* Filled: confirmed crew card */}
            {pos.status === "filled" && pos.selectedCrew && (
              <>
                <div className="mx-4 mb-3 p-3 rounded-xl" style={{ backgroundColor: "#f5f5f5" }}>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div
                      className="rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ width: 52, height: 52, backgroundColor: "#d8d8d8" }}
                    >
                      <IconUser size={22} color="#aaa" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">{pos.selectedCrew.name}</p>
                      <p className="text-xs text-gray-500">{pos.selectedCrew.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                      style={{ backgroundColor: "#111" }}
                    >
                      Confirmed
                    </span>
                    <Link
                      href={`/boat/messages/${pos.selectedCrew.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: "#024BB9" }}
                    >
                      <IconMessage size={13} color="white" /> Message
                    </Link>
                  </div>
                </div>

                {pos.otherApplicants.length > 0 && (
                  <>
                    <button
                      onClick={() => toggleOthers(pos.id)}
                      className="flex items-center gap-1 px-4 pb-2 text-xs text-gray-400"
                    >
                      Others interested ({pos.otherApplicants.length})
                      <span className="ml-0.5" style={{ fontSize: 10 }}>
                        {collapsedOthers[pos.id] ? "▲" : "▼"}
                      </span>
                    </button>
                    {!collapsedOthers[pos.id] && pos.otherApplicants.map((crew) => (
                      <CrewRow key={crew.name} crew={crew} />
                    ))}
                  </>
                )}
              </>
            )}

            {/* Open: list of applicants with Select button */}
            {pos.status === "open" && pos.otherApplicants.length > 0 && (
              pos.otherApplicants.map((crew) => (
                <CrewRow
                  key={crew.name}
                  crew={crew}
                  action={
                    <>
                      <button
                        onClick={() => handleSelectCrew(pos.id, crew)}
                        className="text-xs font-medium px-3 py-1 rounded-full text-white"
                        style={{ backgroundColor: "#111" }}
                      >
                        Select
                      </button>
                      <Link
                        href={`/boat/messages/${crew.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: "#111" }}
                      >
                        <IconMessage size={13} color="white" /> Message
                      </Link>
                    </>
                  }
                />
              ))
            )}

            {/* Open: no applicants */}
            {pos.status === "open" && pos.otherApplicants.length === 0 && (
              <p className="text-xs text-gray-400 px-4 pb-3">No applicants yet</p>
            )}

            <Divider />
          </div>
        ))}

        {/* Actions */}
        <div className="flex items-center gap-4 px-4 py-4 pb-8">
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border"
            style={{ color: "#0161f0", borderColor: "#0161f0" }}
          >
            + Add Position
          </button>
          <button
            className="text-xs font-medium"
            style={{ color: "#0161f0" }}
          >
            Edit regatta
          </button>
        </div>

      </div>

      <BoatNavFooter active="Regattas" />
    </div>
  );
}
