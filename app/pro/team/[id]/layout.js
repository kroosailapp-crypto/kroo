"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  IconUsers, IconCalendar, IconHammer, IconPackage,
  IconMessageCircle, IconBell, IconClipboardList, IconSettings2,
  IconChevronDown, IconLogout, IconSettings,
} from "@tabler/icons-react";

const TeamContext = createContext(null);
export const useTeam = () => useContext(TeamContext);

const NAV = [
  { label: "Dashboard",   href: "",            icon: IconUsers },
  { label: "Roster",      href: "/roster",     icon: IconUsers },
  { label: "Schedule",    href: "/events",     icon: IconCalendar },
  { label: "Inventory",   href: "/inventory",  icon: IconPackage },
  { label: "Maintenance", href: "/maintenance",icon: IconHammer },
  { label: "Requests",    href: "/requests",   icon: IconSettings2 },
  { label: "Chat",        href: "/chat",       icon: IconMessageCircle },
  { label: "Alerts",      href: "/alerts",     icon: IconBell },
  { label: "Surveys",     href: "/surveys",    icon: IconClipboardList },
];

export default function TeamLayout({ children }) {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [team, setTeam] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/pro"); return; }

      const [{ data: t }, { data: m }] = await Promise.all([
        supabase.from("pro_teams").select("*").eq("id", id).single(),
        supabase.from("pro_team_members").select("*").eq("team_id", id).eq("user_id", user.id).single(),
      ]);

      if (!t || !m) { router.push("/pro"); return; }
      setTeam(t);
      setMember(m);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/pro");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f6f6f6" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const base = `/pro/team/${id}`;

  function NavLink({ item }) {
    const href = `${base}${item.href}`;
    const active = item.href === ""
      ? pathname === base
      : pathname.startsWith(href);
    const Icon = item.icon;
    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        style={{
          backgroundColor: active ? "#0161f0" : "transparent",
          color: active ? "#fff" : "#555",
        }}
      >
        <Icon size={18} />
        {item.label}
      </Link>
    );
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#fff", borderRight: "1px solid #e5e5e5" }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: "#e5e5e5" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: "#0161f0" }}
        >
          {team.name[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{team.name}</p>
          <span className="text-xs font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "#39e75f", color: "#02123e" }}>Pro</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {NAV.map(item => <NavLink key={item.label} item={item} />)}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t flex flex-col gap-1" style={{ borderColor: "#e5e5e5" }}>
        {(member.role === "owner" || member.role === "manager") && (
          <Link
            href={`${base}/settings`}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100"
          >
            <IconSettings size={18} />
            Settings
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 w-full text-left"
        >
          <IconLogout size={18} />
          Log out
        </button>
      </div>
    </div>
  );

  // Bottom tab bar items (mobile — key 5)
  const BOTTOM_NAV = [NAV[0], NAV[2], NAV[5], NAV[6], NAV[7]];

  return (
    <TeamContext.Provider value={{ team, member, teamId: id }}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-0 h-screen">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="w-56 h-full shadow-xl">
              <Sidebar />
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b" style={{ borderColor: "#e5e5e5" }}>
            <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: "#0161f0" }}
              >
                {team.name[0]}
              </div>
              <span className="font-semibold text-sm text-gray-900 truncate max-w-[140px]">{team.name}</span>
              <IconChevronDown size={14} className="text-gray-400" />
            </button>
          </div>

          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </main>

          {/* Mobile bottom nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex" style={{ borderColor: "#e5e5e5" }}>
            {BOTTOM_NAV.map(item => {
              const href = `${base}${item.href}`;
              const active = item.href === "" ? pathname === base : pathname.startsWith(href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={href}
                  className="flex-1 flex flex-col items-center py-2 gap-0.5"
                  style={{ color: active ? "#0161f0" : "#aaa" }}
                >
                  <Icon size={22} />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </TeamContext.Provider>
  );
}
