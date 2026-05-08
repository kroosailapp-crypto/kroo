import Image from "next/image";
import Link from "next/link";
import {
  IconAnchor,
  IconCalendarEvent,
  IconMessage,
  IconStar,
  IconUser,
  IconArrowLeft,
  IconFlag,
} from "@tabler/icons-react";

const boatProfiles = {
  1: {
    name: "Dilema",
    location: "Salvador, BA",
    boatClass: "Melges 24",
    skipper: "Linda Petterson",
    crew: 8,
    regattas: 12,
    followers: 40,
    bio: "A competitive Melges 24 based in Salvador. We race nationally and internationally. Looking for experienced trimmers and foredeck crew.",
    website: "www.dilema.com.br",
    instagram: "instagram.com/dilemasail",
    photo: "/boat-image.jpeg",
    upcomingRegattas: [
      {
        name: "Rolex Big Boat Series",
        date: "07/25/26",
        location: "San Francisco, CA",
        positions: [
          { role: "Jib Trimmer", level: "Mid Level – 2–5 years" },
          { role: "Bowman", level: "All levels" },
        ],
      },
      {
        name: "Bay Regatta",
        date: "08/10/26",
        location: "Oakland, CA",
        positions: [
          { role: "Spin Trimmer", level: "Mid Level – 2–5 years" },
        ],
      },
    ],
  },
  2: {
    name: "Bravura",
    location: "San Francisco, CA",
    boatClass: "J/24",
    skipper: "Carlos Mendes",
    crew: 5,
    regattas: 7,
    followers: 27,
    bio: "J/24 racing out of St. Francis Yacht Club. Tuesday night series and regional regattas. Great team culture.",
    website: "",
    instagram: "instagram.com/bravurasail",
    photo: "/boat-image.jpeg",
    upcomingRegattas: [
      {
        name: "Bay Regatta",
        date: "08/10/26",
        location: "Oakland, CA",
        positions: [
          { role: "Tactician", level: "Advanced" },
          { role: "Jib Trimmer", level: "All levels" },
        ],
      },
    ],
  },
  3: {
    name: "Wild Card",
    location: "Newport, RI",
    boatClass: "Etchells",
    skipper: "Tom Walsh",
    crew: 3,
    regattas: 15,
    followers: 55,
    bio: "One of the top Etchells on the East Coast. Competitive team looking for a strong tactician for the upcoming season.",
    website: "wildcardetchells.com",
    instagram: "",
    photo: "/boat-image.jpeg",
    upcomingRegattas: [
      {
        name: "Newport Regatta",
        date: "09/05/26",
        location: "Newport, RI",
        positions: [
          { role: "Tactician", level: "Advanced" },
        ],
      },
    ],
  },
};

function NavFooter() {
  const items = [
    { label: "Home", href: "/crew/feed", icon: <IconAnchor size={22} /> },
    { label: "Regattas", href: "/crew/regattas", icon: <IconCalendarEvent size={22} /> },
    { label: "Message", href: "/crew/messages", icon: <IconMessage size={22} /> },
    { label: "Favorites", href: "/crew/favorites", icon: <IconStar size={22} /> },
    { label: "Profile", href: "/crew/profile", icon: <IconUser size={22} /> },
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
          style={{ color: "#aaa" }}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

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

export default function BoatPublicProfile({ params }) {
  const profile = boatProfiles[params.id] ?? boatProfiles[1];

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {/* Header with back arrow */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href="/crew/feed">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <p className="text-sm font-medium text-gray-800">{profile.name}</p>
      </div>

      <div className="overflow-y-auto flex-1">

        {/* Boat photo + info */}
        <div className="flex gap-3.5 px-4 py-3 items-start">
          <div
            className="rounded-xl flex-shrink-0 overflow-hidden"
            style={{ width: 84, height: 84, backgroundColor: "#e0e0e0" }}
          >
            <Image
              src={profile.photo}
              alt={profile.name}
              width={84}
              height={84}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-gray-900 mb-0.5">{profile.name}</p>
            <p className="text-xs text-gray-500 mb-1.5">{profile.location}</p>
            <Tag label={profile.boatClass} />
            <div className="flex gap-5 mt-2">
              <div>
                <p className="text-base font-semibold text-gray-900">{profile.crew}</p>
                <p className="text-[11px] text-gray-500">Crew</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{profile.regattas}</p>
                <p className="text-[11px] text-gray-500">Regattas</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{profile.followers}</p>
                <p className="text-[11px] text-gray-500">Followers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 px-4 pb-3">
          <Link
            href="/crew/messages"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#111" }}
          >
            <IconMessage size={13} /> Message
          </Link>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#111" }}
          >
            <IconStar size={13} /> Favorite
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#111" }}
          >
            <IconFlag size={13} /> Apply
          </button>
        </div>

        <Divider />

        {/* Bio + links */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">About</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">{profile.bio}</p>
          {profile.website ? (
            <p className="text-sm mb-1" style={{ color: "#007AFF" }}>{profile.website}</p>
          ) : null}
          {profile.instagram ? (
            <p className="text-sm" style={{ color: "#007AFF" }}>{profile.instagram}</p>
          ) : null}
        </div>

        <Divider />

        {/* Skipper */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 36, height: 36, backgroundColor: "#d8d8d8" }}
          >
            <IconUser size={18} color="#aaa" />
          </div>
          <p className="text-sm font-medium text-gray-800">{profile.skipper}</p>
          <span className="text-xs text-gray-400 ml-1">· Skipper</span>
        </div>

        <Divider />

        {/* Upcoming Regattas */}
        <div className="px-4 py-3 pb-8">
          <p className="text-xs text-gray-400 mb-3">Upcoming Regattas</p>
          {profile.upcomingRegattas.map((regatta) => (
            <div key={regatta.name} className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-0.5">{regatta.name}</p>
              <p className="text-xs text-gray-400 mb-2">{regatta.date} · {regatta.location}</p>
              <div className="flex flex-col gap-1.5">
                {regatta.positions.map((pos) => (
                  <div key={pos.role} className="flex items-center gap-2">
                    <Tag label={pos.role} />
                    <span className="text-[11px] text-gray-500">{pos.level}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      <NavFooter />
    </div>
  );
}
