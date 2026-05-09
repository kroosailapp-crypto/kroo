"use client";
import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconMessage,
  IconStar,
  IconUser,
  IconArrowLeft,
  IconFlag,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";

const boatRegattas = [
  {
    id: 1,
    name: "Rolex Big Boat Series",
    date: "07/25/2026",
    positions: ["Jib Trimmer", "Bow", "Spin Trimmer"],
  },
  {
    id: 2,
    name: "Bay Regatta",
    date: "08/10/2026",
    positions: ["Tactician", "Mainsail Trimmer"],
  },
];

function InviteDrawer({ sailorName, onInvite, onClose }) {
  const [selectedRegatta, setSelectedRegatta] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  function handleSend() {
    if (selectedRegatta && selectedPosition) {
      onInvite({ regatta: selectedRegatta, position: selectedPosition });
    }
  }

  const canSend = selectedRegatta && selectedPosition;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-10 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Invite to Race</p>
          <button onClick={onClose}><IconX size={18} color="#999" /></button>
        </div>

        {/* Regatta selection */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Select regatta</p>
          <div className="flex flex-col gap-2">
            {boatRegattas.map((r) => {
              const selected = selectedRegatta?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => { setSelectedRegatta(r); setSelectedPosition(null); }}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl border text-left"
                  style={{
                    borderColor: selected ? "#111" : "#e0e0e0",
                    backgroundColor: selected ? "#111" : "#fff",
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: selected ? "#fff" : "#111" }}>{r.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: selected ? "#ccc" : "#aaa" }}>{r.date}</p>
                  </div>
                  {selected && <IconCheck size={16} color="white" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Position selection — only after a regatta is picked */}
        {selectedRegatta && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Select position</p>
            <div className="flex flex-wrap gap-2">
              {selectedRegatta.positions.map((pos) => {
                const selected = selectedPosition === pos;
                return (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosition(pos)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                    style={{
                      backgroundColor: selected ? "#111" : "#F4F4F4",
                      color: selected ? "#fff" : "#111",
                      borderColor: selected ? "#111" : "#F4F4F4",
                    }}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: canSend ? "#0161F0" : "#c0c0c0" }}
        >
          Send Invite
        </button>
      </div>
    </div>
  );
}

function InviteConfirmModal({ sailorName, regattaName, position, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-8"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 48, height: 48, backgroundColor: "#111" }}
        >
          <IconCheck size={22} color="white" strokeWidth={2.5} />
        </div>
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">
          Invite sent!
        </p>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          <span className="font-semibold text-gray-800">{sailorName}</span> has been invited as{" "}
          <span className="font-semibold text-gray-800">{position}</span> for{" "}
          <span className="font-semibold text-gray-800">{regattaName}</span>.
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: "#0161F0" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// In a real app this would be fetched from a database by ID.
// For now we use sample data.
const crewProfiles = {
  1: {
    name: "Andre Peixoto",
    location: "San Francisco, CA",
    positions: ["Jib Trimmer", "Spin Trimmer", "Main Trimmer"],
    level: "Mid-Level",
    kroo: 15,
    favorites: 31,
    following: 10,
    photo: "/boat-image-placeholder.png",
    availability: ["March 12–15, 2026", "April 3–6, 2026", "May 20–22, 2026"],
    regattas: [
      "2026 Snipe Masters – San Diego",
      "2026 SoCal Ocean Series – Santa Barbara",
      "2026 Nationals – San Francisco",
    ],
    classes: ["Melges 24", "Snipe", "J/24", "470"],
    bio: "Passionate racer with 10+ years of competitive sailing. Comfortable on boats from dinghies to offshore. Always looking for the next regatta.",
    website: "www.boatlink.com",
  },
  2: {
    name: "Sara Lopes",
    location: "Oakland, CA",
    positions: ["Tactician", "Helm"],
    level: "Advanced",
    kroo: 28,
    favorites: 44,
    following: 19,
    photo: "/boat-image-placeholder.png",
    availability: ["April 10–14, 2026", "June 1–5, 2026"],
    regattas: ["2026 Bay Regatta – San Francisco", "2026 Pacific Cup"],
    classes: ["J/105", "Farr 40", "Etchells"],
    bio: "Experienced tactician and helm. 15 years of offshore and inshore racing up and down the West Coast.",
    website: "",
  },
  3: {
    name: "Mike Chen",
    location: "Sausalito, CA",
    positions: ["Bow"],
    level: "Entry Level",
    kroo: 6,
    favorites: 12,
    following: 5,
    photo: "/boat-image-placeholder.png",
    availability: ["May 5–8, 2026"],
    regattas: ["2026 Tuesday Night Series – Oakland"],
    classes: ["J/24", "Lightning"],
    bio: "New to racing but eager to learn. Available most weekends in the Bay Area.",
    website: "",
  },
  4: {
    name: "Julia Martins",
    location: "Berkeley, CA",
    positions: ["Main Trimmer", "Jib Trimmer"],
    level: "Mid-Level",
    kroo: 20,
    favorites: 37,
    following: 14,
    photo: "/boat-image-placeholder.png",
    availability: ["March 20–23, 2026", "May 12–15, 2026"],
    regattas: ["2026 Nationals – San Francisco", "2026 Rolex Big Boat Series"],
    classes: ["Melges 24", "J/70", "Snipe"],
    bio: "Trimmer with a strong background in one-design racing. Love the Melges 24 circuit.",
    website: "juliasails.com",
  },
};

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function Tag({ label }) {
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-bold"
      style={{ backgroundColor: "#E8EDF8", color: "#111" }}
    >
      {label}
    </span>
  );
}

export default function CrewPublicProfile({ params }) {
  const { id } = use(params);
  const profile = crewProfiles[id] ?? crewProfiles[1];
  const [isFavorited, setIsFavorited] = useState(false);
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [inviteConfirm, setInviteConfirm] = useState(null); // { regattaName, position }
  const [isInvited, setIsInvited] = useState(false);

  function handleInvite({ regatta, position }) {
    setShowInviteDrawer(false);
    setInviteConfirm({ regattaName: regatta.name, position });
    setIsInvited(true);
    localStorage.setItem("kroo_crew_regatta_notif", "1");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {showInviteDrawer && (
        <InviteDrawer
          sailorName={profile.name}
          onInvite={handleInvite}
          onClose={() => setShowInviteDrawer(false)}
        />
      )}

      {inviteConfirm && (
        <InviteConfirmModal
          sailorName={profile.name}
          regattaName={inviteConfirm.regattaName}
          position={inviteConfirm.position}
          onClose={() => setInviteConfirm(null)}
        />
      )}

      {/* Header with back arrow */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href="/boat/feed">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <p className="text-sm font-medium text-gray-800">{profile.name}</p>
      </div>

      <div className="overflow-y-auto flex-1">

        {/* Avatar + Info */}
        <div className="flex gap-3.5 px-4 py-3 items-start">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 105, height: 105, backgroundColor: "#d8d8d8" }}
          >
            <IconUser size={32} color="#aaa" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold mb-0.5 text-gray-900">{profile.name}</p>
            <p className="text-xs text-gray-500 mb-2">{profile.location}</p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {profile.positions.map((pos) => (
                <Tag key={pos} label={pos} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-2.5">{profile.level}</p>
            <div className="flex gap-5">
              <div>
                <p className="text-base font-semibold text-gray-900">{profile.kroo}</p>
                <p className="text-[11px] text-gray-500">Kroo</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{profile.favorites}</p>
                <p className="text-[11px] text-gray-500">Favorites</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{profile.following}</p>
                <p className="text-[11px] text-gray-500">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 px-4 pb-3">
          <Link
            href={`/boat/messages/${id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#024BB9" }}
          >
            <IconMessage size={13} /> Message
          </Link>
          <button
            onClick={() => setIsFavorited((f) => !f)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#024BB9" }}
          >
            <IconStar size={13} color="white" fill={isFavorited ? "white" : "none"} />
            {isFavorited ? "Unfavorite" : "Favorite"}
          </button>
          <button
            onClick={() => !isInvited && setShowInviteDrawer(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: isInvited ? "#111" : "#0161F0" }}
          >
            {isInvited
              ? <><IconCheck size={13} color="white" strokeWidth={2.5} /> Invited</>
              : <><IconFlag size={13} /> Invite to Race</>
            }
          </button>
        </div>

        <Divider />

        {/* Availability */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Availability</p>
          {profile.availability.map((date) => (
            <p key={date} className="text-sm text-gray-800 mb-1.5">{date}</p>
          ))}
        </div>

        <Divider />

        {/* Interested Regattas */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Interested Regattas</p>
          {profile.regattas.map((r) => (
            <p key={r} className="text-sm text-gray-800 mb-1.5">{r}</p>
          ))}
        </div>

        <Divider />

        {/* Boat Classes */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Boat Classes Sailed</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.classes.map((cls) => (
              <Tag key={cls} label={cls} />
            ))}
          </div>
        </div>

        <Divider />

        {/* About */}
        <div className="px-4 py-3 pb-8">
          <p className="text-xs text-gray-400 mb-2">About</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">{profile.bio}</p>
          {profile.website ? (
            <p className="text-sm" style={{ color: "#007AFF" }}>{profile.website}</p>
          ) : null}
        </div>

      </div>

      <BoatNavFooter />
    </div>
  );
}
