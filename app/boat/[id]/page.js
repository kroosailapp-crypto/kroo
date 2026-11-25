"use client";
import { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import {
  IconMessage,
  IconStar,
  IconUser,
  IconArrowLeft,
  IconAnchor,
  IconCheck,
  IconDots,
  IconX,
} from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { notify } from "@/lib/notify";
import { MessageLink, MessageHint } from "@/app/components/MessageLink";
import { useProfileSharing } from "@/lib/use-profile-sharing";
import { ShareProfileUI, ShareProfileButton, PublicProfileToggle } from "@/app/components/ShareProfileUI";


function ApplyModal({ boatName, onClose }) {
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
        <p className="text-base font-semibold text-gray-900 text-center">
          Application sent!
        </p>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          A notification was sent to the skipper of{" "}
          <span className="font-semibold text-gray-800">"{boatName}"</span>. If
          you are selected, we will notify you.
        </p>
        <button
          onClick={onClose}
          className="mt-1 w-full lg:w-auto px-6 py-2.5 rounded-2xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#0161f0" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function ReportDrawer({ name, onSubmit, onClose }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!reason.trim() || submitting) return;
    setSubmitting(true);
    await onSubmit(reason.trim());
    setSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-10 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Report {name}</p>
          <button onClick={onClose}><IconX size={18} color="#999" /></button>
        </div>
        <p className="text-sm text-gray-500">
          Tell us what's wrong. We'll review this report and take action if needed.
        </p>
        <textarea
          className="w-full lg:w-auto border rounded-xl px-3 py-2.5 text-sm text-gray-800 resize-none outline-none"
          style={{ borderColor: "#e0e0e0", minHeight: 100 }}
          placeholder="Describe the issue…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={1000}
        />
        <button
          onClick={handleSubmit}
          disabled={!reason.trim() || submitting}
          className="w-full lg:w-auto px-6 py-3.5 rounded-2xl text-sm font-semibold text-white"
          style={{ backgroundColor: !reason.trim() || submitting ? "#c0c0c0" : "#e53e3e" }}
        >
          {submitting ? "Sending…" : "Submit Report"}
        </button>
      </div>
    </div>
  );
}

function ReportConfirmModal({ onClose }) {
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
        <p className="text-base font-semibold text-gray-900 text-center">Report submitted</p>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          Thank you. We'll review this report and take appropriate action.
        </p>
        <button
          onClick={onClose}
          className="w-full lg:w-auto px-6 py-2.5 rounded-2xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#0161F0" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export default function BoatPublicProfile({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [regattas, setRegattas] = useState([]);
  const [filledByPosition, setFilledByPosition] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [appliedPositions, setAppliedPositions] = useState(new Set());
  const [applicantCountByPosition, setApplicantCountByPosition] = useState({});
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportDrawer, setShowReportDrawer] = useState(false);
  const [reportConfirm, setReportConfirm] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const sharing = useProfileSharing({
    kind: "boat",
    id,
    name: profile?.boat_name,
    isPublic: !!profile?.is_public,
    onPublicChange: (v) => setProfile((p) => ({ ...p, is_public: v })),
  });
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    async function load() {
      const [{ data: boat }, { data: regs }] = await Promise.all([
        supabase.from("boat_profiles").select("*").eq("id", id).single(),
        supabase
          .from("regattas")
          .select("*, regatta_positions(*)")
          .eq("boat_id", id)
          .order("created_at"),
      ]);
      if (boat) setProfile(boat);
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

        // Fetch accepted invitations to show confirmed sailors on filled positions
        const regattaIds = regs.map((r) => r.id);
        if (regattaIds.length > 0) {
          const { data: invites } = await supabase
            .from("invitations")
            .select("position_id, crew_profiles(name, avatar_url)")
            .in("regatta_id", regattaIds)
            .eq("status", "accepted");
          if (invites) {
            const map = {};
            for (const inv of invites) {
              map[inv.position_id] = inv.crew_profiles;
            }
            setFilledByPosition(map);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  // Check favorite
  useEffect(() => {
    if (!user) return;
    supabase
      .from("crew_favorites")
      .select("id")
      .eq("crew_id", user.id)
      .eq("boat_id", id)
      .maybeSingle()
      .then(({ data }) => setIsFavorited(!!data));
  }, [user, id]);

  // Load pending applicant counts per position (owner view)
  useEffect(() => {
    if (!user || user.id !== id || regattas.length === 0) return;
    const positionIds = regattas.flatMap(r => (r.regatta_positions || []).map(p => p.id));
    if (positionIds.length === 0) return;
    supabase.from("invitations").select("position_id").in("position_id", positionIds).eq("status", "applied")
      .then(({ data }) => {
        if (!data) return;
        const counts = {};
        for (const row of data) counts[row.position_id] = (counts[row.position_id] || 0) + 1;
        setApplicantCountByPosition(counts);
      });
  }, [user, id, regattas]);

  // Load already-applied positions
  useEffect(() => {
    if (!user) return;
    async function checkApplied() {
      const { data } = await supabase
        .from("invitations")
        .select("position_id")
        .eq("crew_id", user.id)
        .in("status", ["applied", "accepted"]);
      if (data) {
        setAppliedPositions(new Set(data.map((r) => r.position_id)));
      }
    }
    checkApplied();
  }, [user]);

  async function handleReport(reason) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        reported_id: id,
        reported_name: profile?.boat_name || "Unknown",
        profile_type: "boat",
        reason,
      }),
    });
    setShowReportDrawer(false);
    setReportConfirm(true);
  }

  async function handleFavorite() {
    if (!user || favoriteLoading) return;
    setFavoriteLoading(true);
    if (isFavorited) {
      await supabase
        .from("crew_favorites")
        .delete()
        .eq("crew_id", user.id)
        .eq("boat_id", id);
      setIsFavorited(false);
    } else {
      await supabase
        .from("crew_favorites")
        .insert({ crew_id: user.id, boat_id: id });
      setIsFavorited(true);
    }
    setFavoriteLoading(false);
  }

  async function handleApply(regatta, pos) {
    if (!user) return;

    // Optimistic update
    setAppliedPositions((prev) => new Set(prev).add(pos.id));
    setShowModal(true);

    // Insert into invitations as "applied" (sailor-initiated)
    await supabase.from("invitations").upsert(
      {
        regatta_id: regatta.id,
        position_id: pos.id,
        crew_id: user.id,
        role: pos.role,
        status: "applied",
      },
      { onConflict: "position_id,crew_id", ignoreDuplicates: false }
    );

    // Get crew profile name then notify the boat owner
    const { data: crewProf } = await supabase
      .from("crew_profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();
    notify({
      event: "new_application",
      recipient_id: id, // boat owner
      profile_type: "boat",
      sailor_name: crewProf?.name || "A sailor",
      regatta_name: regatta.name,
      position_role: pos.role,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-white pb-20">
        <div className="sticky top-0 z-20 bg-white flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
          <Link href="/crew/feed">
            <IconArrowLeft size={22} color="#111" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Boat not found.</p>
        </div>
        <CrewNavFooter active="Home" />
      </div>
    );
  }

  const isOwner = user?.id === id;
  const openCount = regattas.reduce((sum, r) =>
    sum + (r.regatta_positions || []).filter(p => p.status === "open").length, 0);

  function formatRegattaDate(str) {
    if (!str) return null;
    const [m, d, y] = str.split("/");
    if (!m || !d || !y) return str;
    const date = new Date(`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "#f5f5f5" }}>
      {showModal && <ApplyModal boatName={profile.boat_name} onClose={() => setShowModal(false)} />}
      {showReportDrawer && <ReportDrawer name={profile.boat_name} onSubmit={handleReport} onClose={() => setShowReportDrawer(false)} />}
      {reportConfirm && <ReportConfirmModal onClose={() => setReportConfirm(false)} />}
      <ShareProfileUI sharing={sharing} kind="boat" name={profile.boat_name} />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
        {isOwner
          ? <ProfileSwitcher className="lg:hidden" />
          : <Link href="/crew/feed" className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <IconArrowLeft size={20} color="#111" />
              Back to boat feed
            </Link>
        }
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(v => !v)} className="p-1.5 rounded-full" style={{ color: "#555" }}>
            <IconDots size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border z-50 min-w-[160px] overflow-hidden" style={{ borderColor: "#e8e8e8" }}>
              {!isOwner && <>
                <button onClick={() => { setShowMenu(false); setShowReportDrawer(true); }} className="w-full text-left px-4 py-3 text-sm font-medium" style={{ color: "#e53e3e" }}>Report user</button>
                <button onClick={() => { setShowMenu(false); setBlocked(true); }} className="w-full text-left px-4 py-3 text-sm font-medium border-t" style={{ color: "#e53e3e", borderColor: "#f0f0f0" }}>{blocked ? "Unblock user" : "Block user"}</button>
              </>}
              {isOwner && <PublicProfileToggle isPublic={!!profile.is_public} onClick={() => { setShowMenu(false); sharing.toggle(); }} />}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="flex flex-col gap-3 px-3 pt-3 max-w-[800px] mx-auto w-full">

        {/* Profile card */}
        <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          {/* Boat photo + info */}
          <div className="flex gap-4 items-start">
            <div className="rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: 90, height: 90, backgroundColor: "#e8e8e8" }}>
              {profile.photo_url
                ? <img src={profile.photo_url} alt={profile.boat_name} className="w-full h-full object-cover" />
                : <IconAnchor size={28} color="#ccc" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-gray-400 mb-0.5">{profile.home_port}</p>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[17px] font-bold text-gray-900">{profile.boat_name}</p>
                {profile.boat_class && (
                  <span className="text-[13px] px-2.5 py-0.5 rounded-md font-medium flex-shrink-0" style={{ backgroundColor: "#ebebeb", color: "#555" }}>{profile.boat_class}</span>
                )}
              </div>
              <div className="flex gap-5">
                <div>
                  <p className="text-[15px] font-bold text-gray-900">{regattas.length}</p>
                  <p className="text-[13px] text-gray-400">Regattas</p>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900">{openCount}</p>
                  <p className="text-[13px] text-gray-400">Open positions</p>
                </div>
              </div>
            </div>
            {/* Favorite star */}
            <button onClick={handleFavorite} disabled={favoriteLoading} className="p-1 flex-shrink-0">
              <IconStar size={22} color={isFavorited ? "#f5a623" : "#bbb"} fill={isFavorited ? "#f5a623" : "none"} />
            </button>
          </div>

          {/* Skipper */}
          {profile.skipper_name && (
            <div className="flex items-center gap-2.5 mt-4">
              <div className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: 40, height: 40, backgroundColor: "#d8d8d8" }}>
                {profile.skipper_photo_url
                  ? <img src={profile.skipper_photo_url} alt={profile.skipper_name} className="w-full h-full object-cover" />
                  : <IconUser size={20} color="#aaa" />}
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900">{profile.skipper_name}</p>
                <p className="text-[13px] text-gray-400">Skipper</p>
              </div>
            </div>
          )}

          {/* About */}
          {profile.about && (
            <div className="mt-4 px-3 py-3 rounded-xl" style={{ backgroundColor: "#f5f5f5" }}>
              <p className="text-[14px] text-gray-700 leading-relaxed">{profile.about}</p>
            </div>
          )}

          {/* Message button */}
          {!isOwner && (
            <>
              <MessageLink toId={id} href={`/crew/messages/${id}`} className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border" style={{ color: "#0161F0", borderColor: "#0161F0" }}>
                <IconMessage size={16} /> Message
              </MessageLink>
              <MessageHint toId={id} className="mt-2 text-center">You can message this boat once it invites you to a regatta or selects you for a position.</MessageHint>
            </>
          )}
        </div>

        {/* Edit Profile button — owner only */}
        {isOwner && (
          <Link href="/boat/edit" className="bg-white rounded-2xl px-4 py-3 flex items-center justify-center text-[15px] font-semibold border" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)", color: "#0161F0", borderColor: "#0161F0" }}>
            Edit Profile
          </Link>
        )}

        {/* Share profile button — owner only */}
        {isOwner && <ShareProfileButton onClick={sharing.share} className="bg-white rounded-2xl px-4 py-3" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }} />}

        {/* Regatta cards */}
        {regattas.map((regatta) => {
          const allPositions = (regatta.regatta_positions || []).slice().sort((a, b) => a.role.localeCompare(b.role));
          if (allPositions.length === 0) return null;
          return (
            <div key={regatta.id} className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
              {regatta.date && <p className="text-[13px] text-gray-400 mb-1">{formatRegattaDate(regatta.date)}</p>}
              <p className="text-[20px] font-bold text-gray-900 leading-tight mb-1">{regatta.name}</p>
              {(regatta.location || regatta.venue) && (
                <p className="text-[14px] text-gray-400 mb-3">
                  {[regatta.location, regatta.venue].filter(Boolean).join(" • ")}
                </p>
              )}
              <div className="h-px mb-3" style={{ backgroundColor: "#e8e8e8" }} />
              <div className="flex flex-col gap-0">
                {allPositions.map((pos, i) => {
                  const isFilled = pos.status === "filled";
                  const sailor = filledByPosition[pos.id];
                  const applied = appliedPositions.has(pos.id);
                  const applicantCount = applicantCountByPosition[pos.id] || 0;
                  return (
                    <div key={pos.id}>
                      {i > 0 && <div className="h-px my-2" style={{ backgroundColor: "#f0f0f0" }} />}
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-[14px] px-3 py-1 rounded-md font-medium flex-shrink-0" style={{ backgroundColor: "#f0f2f5", color: "#333" }}>{pos.role}</span>
                        {/* Owner view: show applicant count badge on open positions */}
                        {isOwner && !isFilled && applicantCount > 0 && (
                          <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 22, height: 22, backgroundColor: "#e53e3e" }}>
                            <span className="text-[11px] font-bold text-white">{applicantCount}</span>
                          </div>
                        )}
                        {isFilled ? (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 26, height: 26, backgroundColor: "#d8d8d8" }}>
                              {sailor?.avatar_url ? <img src={sailor.avatar_url} alt="" className="w-full h-full object-cover" /> : <IconUser size={13} color="#aaa" />}
                            </div>
                            <span className="text-[14px] font-semibold text-gray-800 truncate">{sailor?.name || "—"}</span>
                          </div>
                        ) : (
                          <span className="text-[14px] text-gray-400 flex-1">{pos.level || "All levels"}</span>
                        )}
                        {isFilled ? (
                          <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 28, height: 28, backgroundColor: "#111" }}>
                            <IconCheck size={15} color="white" strokeWidth={2.5} />
                          </div>
                        ) : isOwner ? (
                          <span className="text-[13px] font-medium px-3 py-1 rounded-md flex-shrink-0 border" style={{ color: "#888", borderColor: "#d0d0d0" }}>Open</span>
                        ) : applied ? (
                          <span className="text-[13px] font-semibold px-3 py-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#EFF6FF", color: "#0161F0" }}>Applied</span>
                        ) : (
                          <button onClick={() => handleApply(regatta, pos)} className="text-[14px] font-semibold px-4 py-1.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: "#0161F0" }}>Apply</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Manage Regatta link — owner only */}
              {isOwner && (
                <Link href={`/boat/regattas/${regatta.id}`} className="mt-3 text-[14px] font-semibold" style={{ color: "#0161F0" }}>
                  Manage Regatta
                </Link>
              )}
            </div>
          );
        })}

        {regattas.length === 0 && (
          <div className="bg-white rounded-2xl px-4 py-8 flex items-center justify-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <p className="text-sm text-gray-400">No regattas posted yet.</p>
          </div>
        )}

        </div>
      </div>

      <CrewNavFooter active="Home" />
    </div>
  );
}
