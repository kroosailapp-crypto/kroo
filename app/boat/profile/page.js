"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconUser, IconDotsVertical, IconAnchor, IconCheck } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useProfileSharing } from "@/lib/use-profile-sharing";
import { ShareProfileUI, ShareProfileButton, PublicProfileToggle } from "@/app/components/ShareProfileUI";
import ZoomableImage from "@/app/components/ZoomableImage";

function ProfileMenu({ onDelete, isPublic, onTogglePublic }) {
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
        <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-lg border py-1 z-50 min-w-[200px]" style={{ borderColor: "#e8e8e8" }}>
          <PublicProfileToggle isPublic={isPublic} onClick={() => { setOpen(false); onTogglePublic(); }} />
          <div className="h-px mx-4" style={{ backgroundColor: "#e8e8e8" }} />
          <Link href="/notifications?from=boat" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50">
            Notifications
          </Link>
          <div className="h-px mx-4" style={{ backgroundColor: "#e8e8e8" }} />
          <Link href="/contact" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50">
            Contact us
          </Link>
          <div className="h-px mx-4" style={{ backgroundColor: "#e8e8e8" }} />
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
            style={{ color: "#e00" }}
          >
            Delete Boat Profile
          </button>
          <div className="h-px mx-4" style={{ backgroundColor: "#e8e8e8" }} />
          <Link href="/terms" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50">
            Terms of Use
          </Link>
          <div className="h-px mx-4" style={{ backgroundColor: "#e8e8e8" }} />
          <Link href="/privacy" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50">
            Privacy Policy
          </Link>
        </div>
      )}
    </div>
  );
}

function DeleteProfileModal({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">Delete Boat Profile?</p>
        <p className="text-xs text-gray-400 text-center -mt-2">Your boat profile, regattas, and messages will be permanently deleted. This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold border" style={{ color: "#111", borderColor: "#d0d0d0" }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: "#e00" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function formatRegattaDate(str) {
  if (!str) return "";
  const [m, d, y] = str.split("/");
  if (!m || !d || !y) return str;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const month = months[parseInt(m, 10) - 1] || m;
  return `${month} ${parseInt(d, 10)}, ${y}`;
}

export default function BoatProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [regattas, setRegattas] = useState([]);
  const [applicantCountByPosition, setApplicantCountByPosition] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const sharing = useProfileSharing({
    kind: "boat",
    id: user?.id,
    name: profile?.boat_name,
    isPublic: !!profile?.is_public,
    onPublicChange: (v) => setProfile((p) => ({ ...p, is_public: v })),
  });

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.push("/boat/login"); return; }
    loadData();
  }, [user]);

  useEffect(() => {
    if (regattas.length === 0) return;
    const positionIds = regattas.flatMap(r => (r.regatta_positions || []).map(p => p.id));
    if (positionIds.length === 0) return;
    supabase.from("invitations").select("position_id").in("position_id", positionIds).eq("status", "applied")
      .then(({ data }) => {
        if (!data) return;
        const counts = {};
        for (const row of data) counts[row.position_id] = (counts[row.position_id] || 0) + 1;
        setApplicantCountByPosition(counts);
      });
  }, [regattas]);

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

  async function handleDeleteProfile() {
    setShowDeleteModal(false);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/profile/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ profileType: "boat" }),
    });
    const data = await res.json();
    if (data.deleteAccount) {
      await signOut();
      router.push("/");
    } else {
      router.push(data.redirectTo);
    }
  }

  if (loading || user === undefined) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>;
  }

  const totalOpenPositions = regattas.reduce((sum, r) => {
    return sum + (r.regatta_positions || []).filter(p => !p.filled_by).length;
  }, 0);

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "#f5f5f5" }}>
      {showDeleteModal && <DeleteProfileModal onConfirm={handleDeleteProfile} onClose={() => setShowDeleteModal(false)} />}
      <ShareProfileUI sharing={sharing} kind="boat" name={profile?.boat_name} />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
        <ProfileSwitcher className="lg:hidden" />
        <ProfileMenu onDelete={() => setShowDeleteModal(true)} isPublic={!!profile?.is_public} onTogglePublic={sharing.toggle} />
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="flex flex-col gap-3 px-3 pt-3 pb-4 max-w-[800px] mx-auto w-full">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div className="flex gap-4 items-start">
            <div
              className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ width: 90, height: 90, backgroundColor: "#e8e8e8" }}
            >
              {profile?.photo_url
                ? <ZoomableImage src={profile.photo_url} alt="Boat" className="w-full h-full object-cover" />
                : <IconAnchor size={28} color="#ccc" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-gray-400 mb-0.5">{profile?.home_port}</p>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <p className="text-[17px] font-bold text-gray-900">{profile?.boat_name || "—"}</p>
                {profile?.boat_class && (
                  <span className="text-[13px] px-2.5 py-0.5 rounded-md font-medium flex-shrink-0" style={{ backgroundColor: "#ebebeb", color: "#555" }}>
                    {profile.boat_class}
                  </span>
                )}
              </div>
              <div className="flex gap-5">
                <div>
                  <p className="text-[15px] font-bold text-gray-900">{regattas.length}</p>
                  <p className="text-[12px] text-gray-400">Regattas</p>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900">{totalOpenPositions}</p>
                  <p className="text-[12px] text-gray-400">Open</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skipper */}
          {profile?.skipper_name && (
            <div className="flex items-center gap-3 mt-4">
              <div
                className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ width: 40, height: 40, backgroundColor: "#d8d8d8" }}
              >
                {profile.skipper_photo_url
                  ? <ZoomableImage src={profile.skipper_photo_url} alt="Skipper" className="w-full h-full object-cover" />
                  : <IconUser size={20} color="#aaa" />}
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900">{profile.skipper_name}</p>
                <p className="text-[12px] text-gray-400">Skipper</p>
              </div>
            </div>
          )}

          {/* About */}
          {profile?.about && (
            <div className="mt-3 rounded-xl px-3 py-3" style={{ backgroundColor: "#f5f5f5" }}>
              <p className="text-[14px] text-gray-700 leading-relaxed">{profile.about}</p>
            </div>
          )}

          {/* Edit Profile */}
          <Link
            href="/boat/edit"
            className="mt-4 flex items-center justify-center py-2.5 rounded-xl text-[15px] font-semibold border"
            style={{ color: "#0161F0", borderColor: "#0161F0" }}
          >
            Edit Profile
          </Link>

          {/* Share profile */}
          <ShareProfileButton onClick={sharing.share} className="mt-2 w-full py-2.5 rounded-xl" />
        </div>

        {/* Add Regatta */}
        <Link
          href="/boat/regattas/new"
          className="rounded-2xl px-4 py-3 flex items-center justify-center text-[15px] font-semibold text-white"
          style={{ backgroundColor: "#0161F0" }}
        >
          + Add Regatta
        </Link>

        {/* Regatta Cards */}
        {regattas.map((reg) => {
          const positions = reg.regatta_positions || [];
          return (
            <div key={reg.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
              <div className="px-4 pt-4 pb-3">
                {reg.date && (
                  <p className="text-[12px] text-gray-400 mb-0.5">{formatRegattaDate(reg.date)}</p>
                )}
                <p className="text-[17px] font-bold text-gray-900 mb-0.5">{reg.name}</p>
                {(reg.location || reg.venue) && (
                  <p className="text-[13px] text-gray-400">
                    {[reg.location, reg.venue].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              {positions.length > 0 && (
                <>
                  <div className="h-px mx-4" style={{ backgroundColor: "#f0f0f0" }} />
                  <div className="px-4 py-3 flex flex-col gap-2.5">
                    {positions.map((pos) => {
                      const isFilled = !!pos.filled_by;
                      const applicantCount = applicantCountByPosition[pos.id] || 0;
                      return (
                        <div key={pos.id} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-gray-900 truncate">{pos.role}</p>
                            {pos.level && <p className="text-[12px] text-gray-400">{pos.level}</p>}
                          </div>
                          {!isFilled && applicantCount > 0 && (
                            <div
                              className="flex items-center justify-center rounded-full flex-shrink-0"
                              style={{ width: 22, height: 22, backgroundColor: "#e53e3e" }}
                            >
                              <span className="text-[11px] font-bold text-white">{applicantCount}</span>
                            </div>
                          )}
                          {isFilled ? (
                            <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 28, height: 28, backgroundColor: "#e8f5e9" }}>
                              <IconCheck size={14} color="#2e7d32" />
                            </div>
                          ) : (
                            <span
                              className="text-[13px] font-semibold px-3 py-1 rounded-md border flex-shrink-0"
                              style={{ color: "#555", borderColor: "#d0d0d0" }}
                            >
                              Open
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="h-px mx-4" style={{ backgroundColor: "#f0f0f0" }} />
              <div className="px-4 py-3">
                <Link href={`/boat/regattas/${reg.id}`} className="text-[14px] font-semibold" style={{ color: "#0161F0" }}>
                  Manage Regatta
                </Link>
              </div>
            </div>
          );
        })}

        {/* Log Out */}
        <div className="mt-2">
          <button
            onClick={async () => { await signOut(); router.push("/"); }}
            className="w-full py-3 rounded-2xl text-[15px] font-semibold bg-white border"
            style={{ color: "#e00", borderColor: "#e00", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
          >
            Log Out
          </button>
        </div>
        </div>
      </div>

      <BoatNavFooter active="Profile" />
    </div>
  );
}
