"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconUser, IconDotsVertical } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function Tag({ label }) {
  return (
    <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: "#E8EDF8", color: "#111" }}>
      {label}
    </span>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative ml-auto">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center justify-center p-1.5">
        <IconDotsVertical size={20} color="#111" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-lg border py-1 z-50 min-w-[160px]" style={{ borderColor: "#e8e8e8" }}>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50">
            Notifications
          </Link>
          <div className="h-px mx-4" style={{ backgroundColor: "#e8e8e8" }} />
          <Link href="/contact" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50">
            Contact us
          </Link>
          <div className="h-px mx-4" style={{ backgroundColor: "#e8e8e8" }} />
          <Link href="/help" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50">
            Help
          </Link>
          <div className="h-px mx-4" style={{ backgroundColor: "#e8e8e8" }} />
          <Link href="/terms" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50">
            Terms of Use
          </Link>
        </div>
      )}
    </div>
  );
}

export default function BoatProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [regattas, setRegattas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.push("/boat/login"); return; }
    loadData();
  }, [user]);

  async function loadData() {
    const [{ data: prof }, { data: regs }] = await Promise.all([
      supabase.from("boat_profiles").select("*").eq("id", user.id).single(),
      supabase.from("regattas").select("*, regatta_positions(*)").eq("boat_id", user.id).order("created_at"),
    ]);
    if (prof) setProfile(prof);
    if (regs) {
      const now = new Date();
      const parseDate = (str) => {
        if (!str) return null;
        const [m, d, y] = str.split("/");
        if (!m || !d || !y) return null;
        return new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
      };
      const sorted = [...regs].sort((a, b) => {
        const da = parseDate(a.date);
        const db = parseDate(b.date);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        const aUp = da >= now;
        const bUp = db >= now;
        if (aUp && !bUp) return -1;
        if (!aUp && bUp) return 1;
        return aUp ? da - db : db - da;
      });
      setRegattas(sorted);
    }
    setLoading(false);
  }

  if (loading || user === undefined) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* App Bar */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        <ProfileSwitcher />
        <ProfileMenu />
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Boat Photo + Info */}
        <div className="flex gap-3.5 px-4 py-3 items-start">
          <div className="rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: 105, height: 105, backgroundColor: "#e0e0e0" }}>
            {profile?.photo_url
              ? <img src={profile.photo_url} alt="Boat" className="w-full h-full object-cover" />
              : null}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 mb-0.5">{profile?.boat_name || "—"}</p>
            <p className="text-sm text-gray-500 mb-1.5">{profile?.home_port || "—"}</p>
            {profile?.boat_class && <Tag label={profile.boat_class} />}
            <div className="flex gap-5 mt-2">
              <div><p className="text-base font-semibold text-gray-900">0</p><p className="text-[13px] text-gray-500">Crew</p></div>
              <div><p className="text-base font-semibold text-gray-900">{regattas.length}</p><p className="text-[13px] text-gray-500">Regattas</p></div>
              <div><p className="text-base font-semibold text-gray-900">0</p><p className="text-[13px] text-gray-500">Followers</p></div>
            </div>
          </div>
        </div>

        {/* Bio + Links */}
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {profile?.about || "Add a description of your boat — your racing history, what kind of crew you're looking for, and what makes sailing with you special."}
          </p>
          {profile?.website && (
            <>
              <p className="text-xs text-gray-400 mb-0.5">Official Website</p>
              <p className="text-sm mb-2" style={{ color: "#007AFF" }}>{profile.website}</p>
            </>
          )}
          {profile?.instagram && (
            <>
              <p className="text-xs text-gray-400 mb-0.5">Instagram</p>
              <p className="text-sm mb-4" style={{ color: "#007AFF" }}>{profile.instagram}</p>
            </>
          )}
          <Link href="/boat/edit" className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium border" style={{ color: "#0161f0", borderColor: "#0161f0" }}>
            Edit Boat Profile
          </Link>
        </div>

        <Divider />

        {/* Skipper */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: 36, height: 36, backgroundColor: "#d8d8d8" }}>
            {profile?.skipper_photo_url
              ? <img src={profile.skipper_photo_url} alt="Skipper" className="w-full h-full object-cover" />
              : <IconUser size={18} color="#aaa" />}
          </div>
          <p className="text-sm font-medium text-gray-800">{profile?.skipper_name || "—"}</p>
          <span className="text-xs text-gray-400 ml-1">· Skipper</span>
        </div>

        <Divider />

        {/* Upcoming Regattas */}
        <div className="px-4 py-3 pb-6">
          <p className="text-xs text-gray-400 mb-2">Upcoming Regattas</p>

          {regattas.length === 0 && (
            <p className="text-sm text-gray-400 mb-3">No regattas yet.</p>
          )}

          {regattas.map((reg) => (
            <div key={reg.id} className="mb-4">
              <p className="text-sm font-medium text-gray-800 mb-1.5">
                {reg.name}{reg.date ? `, ${reg.date}` : ""}{reg.location ? `, ${reg.location}` : ""}
              </p>
              <div className="flex flex-col gap-1.5 mb-2">
                {(reg.regatta_positions || []).map((pos) => (
                  <div key={pos.id} className="flex items-center gap-2">
                    <Tag label={pos.role} />
                    {pos.level && <span className="text-[13px] text-gray-500">{pos.level}</span>}
                  </div>
                ))}
              </div>
              <Link href={`/boat/regattas/${reg.id}`} className="inline-flex text-xs font-medium" style={{ color: "#0161f0" }}>
                Manage regatta
              </Link>
            </div>
          ))}

          <Link href="/boat/regattas/new" className="text-xs font-medium" style={{ color: "#0161f0" }}>
            + Add Regatta
          </Link>
        </div>

        {/* Browse Crew CTA */}
        <div className="px-4 pb-8">
          <Link href="/boat/feed" className="w-full flex items-center justify-center py-3 rounded-full font-medium text-sm" style={{ backgroundColor: "#0161f0", color: "#fff" }}>
            Browse Crew →
          </Link>
        </div>

        <div className="px-4 pb-10">
          <div className="h-px w-full mb-6" style={{ backgroundColor: "#e8e8e8" }} />
          <button
            onClick={async () => { await signOut(); router.push("/"); }}
            className="w-full py-3 rounded-full text-sm font-semibold border"
            style={{ color: "#e00", borderColor: "#fca5a5" }}
          >
            Log Out
          </button>
        </div>
      </div>

      <BoatNavFooter active="Profile" />
    </div>
  );
}
