import Image from "next/image";
import Link from "next/link";

function NavFooter({ active }) {
  const items = [
    { label: "Home", href: "/boat/feed", icon: "🏠" },
    { label: "Regattas", href: "/boat/regattas", icon: "📅" },
    { label: "Message", href: "/boat/messages", icon: "💬" },
    { label: "Following", href: "/boat/following", icon: "⭐" },
    { label: "Profile", href: "/boat/profile", icon: "👤" },
  ];
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-center justify-around px-2 py-2 border-t"
      style={{ backgroundColor: "#fff", borderColor: "#e5e5e5" }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-1 text-xs"
          style={{ color: active === item.label ? "#0161f0" : "#888" }}
        >
          <span className="text-xl">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function BoatProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#e5e5e5" }}>
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={60} height={24} />
        <Link
          href="/boat/edit"
          className="text-sm font-medium px-4 py-1.5 rounded-full border"
          style={{ color: "#0161f0", borderColor: "#0161f0" }}
        >
          Edit Profile
        </Link>
      </header>

      <main className="flex-1 px-5 py-6 flex flex-col gap-6">

        {/* Boat photo + name */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
            style={{ backgroundColor: "#0161f0" }}
          >
            ⛵
          </div>
          <button
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: "#e8efff", color: "#0161f0" }}
          >
            + Add Photo
          </button>
          <p className="text-xl font-bold text-gray-900">Your Boat Name</p>
          <p className="text-sm text-gray-500">Home Port · Boat Class</p>
        </div>

        {/* Stats */}
        <div className="flex justify-around py-3 border-y" style={{ borderColor: "#e5e5e5" }}>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg text-gray-900">0</span>
            <span className="text-xs text-gray-400">Crew</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg text-gray-900">0</span>
            <span className="text-xs text-gray-400">Regattas</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg text-gray-900">0</span>
            <span className="text-xs text-gray-400">Followers</span>
          </div>
        </div>

        {/* Sections to complete */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">Complete your profile</p>

          {[
            { label: "Add boat description", href: "/boat/edit", done: false },
            { label: "Add regattas / events", href: "/boat/regattas", done: false },
            { label: "Set crew positions needed", href: "/boat/edit", done: true },
            { label: "Add website or social links", href: "/boat/edit", done: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between px-4 py-3 rounded-xl border"
              style={{ borderColor: "#e5e5e5" }}
            >
              <div className="flex items-center gap-3">
                <span style={{ color: item.done ? "#39e75f" : "#ccc" }}>
                  {item.done ? "✅" : "○"}
                </span>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <span className="text-gray-400 text-sm">›</span>
            </Link>
          ))}
        </div>

        {/* Browse crew CTA */}
        <Link
          href="/boat/feed"
          className="w-full flex items-center justify-center py-3 rounded-full font-medium text-sm mt-2"
          style={{ backgroundColor: "#0161f0", color: "#fff" }}
        >
          Browse Crew →
        </Link>

      </main>

      <NavFooter active="Profile" />
    </div>
  );
}
