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
} from "@tabler/icons-react";

function NavFooter({ active }) {
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
          style={{ color: active === item.label ? "#111" : "#aaa" }}
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

export default function BoatProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {/* App Bar */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={52} height={20} />
        <div
          className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-400"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <IconSearch size={14} color="#aaa" />
          <span>Search</span>
        </div>
        <IconPlus size={22} color="#111" />
      </div>

      <div className="overflow-y-auto flex-1">

        {/* Boat Photo + Info */}
        <div className="flex gap-3.5 px-4 py-3 items-start">
          <div
            className="rounded-xl flex-shrink-0"
            style={{ width: 105, height: 105, backgroundColor: "#e0e0e0" }}
          />
          <div>
            <p className="text-xl font-bold text-gray-900 mb-0.5">Boat Name</p>
            <p className="text-sm text-gray-500 mb-1.5">San Francisco, CA</p>
            <Tag label="Boat Class" />
            <div className="flex gap-5 mt-2">
              <div>
                <p className="text-base font-semibold text-gray-900">0</p>
                <p className="text-[11px] text-gray-500">Crew</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">0</p>
                <p className="text-[11px] text-gray-500">Regattas</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">0</p>
                <p className="text-[11px] text-gray-500">Followers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio + Links */}
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Add a description of your boat — your racing history, what kind of crew you're looking for, and what makes sailing with you special.
          </p>
          <p className="text-xs text-gray-400 mb-0.5">Official Website</p>
          <p className="text-sm mb-2" style={{ color: "#007AFF" }}>www.boatlink.com</p>
          <p className="text-xs text-gray-400 mb-0.5">Instagram</p>
          <p className="text-sm mb-4" style={{ color: "#007AFF" }}>instagram.com/boatname</p>
          <Link
            href="/boat/edit"
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium border"
            style={{ color: "#0161f0", borderColor: "#0161f0" }}
          >
            Edit Boat Profile
          </Link>
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
          <p className="text-sm font-medium text-gray-800">Your Name</p>
          <span className="text-xs text-gray-400 ml-1">· Skipper</span>
        </div>

        <Divider />

        {/* Upcoming Regattas */}
        <div className="px-4 py-3 pb-6">
          <p className="text-xs text-gray-400 mb-2">Upcoming Regattas</p>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-800 mb-1.5">
              Rolex Big Boat Series, 07/25/26, San Francisco
            </p>
            <div className="flex flex-col gap-1.5 mb-2">
              <div className="flex items-center gap-2">
                <Tag label="Jib Trimmer" />
                <span className="text-[11px] text-gray-500">Mid Level – 2–5 years</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag label="Bowman" />
                <span className="text-[11px] text-gray-500">All levels</span>
              </div>
            </div>
            <Link
              href="/boat/regattas"
              className="inline-flex text-xs font-medium"
              style={{ color: "#0161f0" }}
            >
              Edit regatta
            </Link>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-800 mb-1.5">
              Bay Regatta, 08/10/26, Oakland
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Tag label="Spin Trimmer" />
              <span className="text-[11px] text-gray-500">Mid Level – 2–5 years</span>
            </div>
          </div>

          <button
            className="text-xs font-medium"
            style={{ color: "#0161f0" }}
          >
            + Add Regatta
          </button>
        </div>

        {/* Browse Crew CTA */}
        <div className="px-4 pb-8">
          <Link
            href="/boat/feed"
            className="w-full flex items-center justify-center py-3 rounded-full font-medium text-sm"
            style={{ backgroundColor: "#0161f0", color: "#fff" }}
          >
            Browse Crew →
          </Link>
        </div>

      </div>

      <NavFooter active="Profile" />
    </div>
  );
}
