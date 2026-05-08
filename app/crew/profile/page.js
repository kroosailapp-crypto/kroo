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
  IconPencil,
} from "@tabler/icons-react";

function NavFooter({ active }) {
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

export default function CrewProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {/* App Bar — same as boat profile */}
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

        {/* Avatar + Info */}
        <div className="flex gap-3.5 px-4 py-3 items-start">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 70, height: 70, backgroundColor: "#d8d8d8" }}
          >
            <IconUser size={32} color="#aaa" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold mb-0.5 text-gray-900">Your Name</p>
            <p className="text-xs text-gray-500 mb-2">San Francisco, CA</p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <Tag label="Jib Trimmer" />
              <Tag label="Spin Trimmer" />
              <Tag label="Main Trimmer" />
            </div>
            <p className="text-xs text-gray-400 mb-2.5">Mid-Level</p>
            <div className="flex gap-5">
              <div>
                <p className="text-base font-semibold text-gray-900">15</p>
                <p className="text-[11px] text-gray-500">Kroo</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">31</p>
                <p className="text-[11px] text-gray-500">Favorites</p>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">10</p>
                <p className="text-[11px] text-gray-500">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="px-4 pb-3">
          <Link
            href="/crew/edit"
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium border"
            style={{ color: "#0161f0", borderColor: "#0161f0" }}
          >
            Edit Profile
          </Link>
        </div>

        <Divider />

        {/* Availability */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Availability</p>
          <p className="text-sm text-gray-800 mb-1.5">March 12–15, 2026</p>
          <p className="text-sm text-gray-800 mb-1.5">April 3–6, 2026</p>
          <p className="text-sm text-gray-800 mb-1.5">May 20–22, 2026</p>
          <button
            className="mt-1 text-xs font-medium"
            style={{ color: "#0161f0" }}
          >
            + Add Availability
          </button>
        </div>

        <Divider />

        {/* Interested Regattas */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Interested Regattas</p>
          <p className="text-sm text-gray-800 mb-1.5">2026 Snipe Masters – San Diego</p>
          <p className="text-sm text-gray-800 mb-1.5">2026 SoCal Ocean Series – Santa Barbara</p>
          <p className="text-sm text-gray-800 mb-1.5">2026 Nationals – San Francisco</p>
          <button
            className="mt-1 text-xs font-medium"
            style={{ color: "#0161f0" }}
          >
            + Add Regatta
          </button>
        </div>

        <Divider />

        {/* Boat Classes */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Boat Classes Sailed</p>
          <div className="flex flex-wrap gap-1.5">
            <Tag label="Melges 24" />
            <Tag label="Snipe" />
            <Tag label="J/24" />
            <Tag label="470" />
          </div>
          <button
            className="mt-2 text-xs font-medium"
            style={{ color: "#0161f0" }}
          >
            + Add Classes
          </button>
        </div>

        <Divider />

        {/* About / Bio */}
        <div className="px-4 py-3 pb-6">
          <p className="text-xs text-gray-400 mb-2">About</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            Passionate racer with 10+ years of competitive sailing. Comfortable on boats from dinghies to offshore. Always looking for the next regatta.
          </p>
          <p className="text-sm" style={{ color: "#007AFF" }}>www.boatlink.com</p>
        </div>

        {/* Browse Boats CTA */}
        <div className="px-4 pb-8">
          <Link
            href="/crew/feed"
            className="w-full flex items-center justify-center py-3 rounded-full font-medium text-sm"
            style={{ backgroundColor: "#0161f0", color: "#fff" }}
          >
            Browse Boats →
          </Link>
        </div>

      </div>

      <NavFooter active="Profile" />
    </div>
  );
}
