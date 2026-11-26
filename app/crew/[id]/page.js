"use client";
import { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import {
  IconMessage,
  IconStar,
  IconUser,
  IconArrowLeft,
  IconFlag,
  IconX,
  IconCheck,
  IconDots,
} from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { notify } from "@/lib/notify";
import { MessageLink, MessageHint } from "@/app/components/MessageLink";
import ZoomableImage from "@/app/components/ZoomableImage";


function InviteDrawer({ sailorName, regattas, invitedRegattaIds = [], onInvite, onClose }) {
  const [selectedRegatta, setSelectedRegatta] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const canSend = selectedRegatta && selectedPosition;

  function handleSend() {
    if (canSend) onInvite({ regatta: selectedRegatta, position: selectedPosition });
  }

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
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Invite to Sail</p>
          <button onClick={onClose}>
            <IconX size={18} color="#999" />
          </button>
        </div>

        {regattas.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            You have no regattas yet.{" "}
            <Link href="/boat/regattas/new" onClick={onClose} className="font-medium" style={{ color: "#0161f0" }}>
              Add one →
            </Link>
          </p>
        ) : (
          <>
            <div>
              <p className="text-xs text-gray-400 mb-2">Select regatta</p>
              <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto overscroll-contain">
                {regattas.map((r) => {
                  const selected = selectedRegatta?.id === r.id;
                  const alreadyInvited = invitedRegattaIds.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedRegatta(r); setSelectedPosition(null); }}
                      className="flex items-center justify-between px-4 py-3 rounded-2xl border text-left"
                      style={{
                        borderColor: selected ? "#111" : alreadyInvited ? "#e0e0e0" : "#e0e0e0",
                        backgroundColor: selected ? "#111" : alreadyInvited ? "#f7f7f7" : "#fff",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: selected ? "#fff" : "#111" }}>
                          {r.name}
                        </p>
                        {r.date && (
                          <p className="text-xs mt-0.5" style={{ color: selected ? "#ccc" : "#aaa" }}>
                            {r.date}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {alreadyInvited && !selected && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#e8e8e8", color: "#888" }}>
                            Invited
                          </span>
                        )}
                        {selected && <IconCheck size={16} color="white" strokeWidth={2.5} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedRegatta && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Select position</p>
                {(selectedRegatta.regatta_positions || []).filter(p => p.status === "open").length === 0 ? (
                  <p className="text-xs text-gray-400">No open positions for this regatta.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(selectedRegatta.regatta_positions || [])
                      .filter(p => p.status === "open")
                      .map((pos) => {
                        const selected = selectedPosition?.id === pos.id;
                        return (
                          <button
                            key={pos.id}
                            onClick={() => setSelectedPosition(pos)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                            style={{
                              backgroundColor: selected ? "#111" : "#F4F4F4",
                              color: selected ? "#fff" : "#111",
                              borderColor: selected ? "#111" : "#F4F4F4",
                            }}
                          >
                            {pos.role}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-full lg:w-auto px-6 py-3.5 rounded-2xl text-sm font-semibold text-white"
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
          <span className="font-semibold text-gray-800">{sailorName}</span> has
          been invited as{" "}
          <span className="font-semibold text-gray-800">{position}</span> for{" "}
          <span className="font-semibold text-gray-800">{regattaName}</span>.
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

export default function CrewPublicProfile({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myRegattas, setMyRegattas] = useState([]);
  const [existingInviteRegattaIds, setExistingInviteRegattaIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [inviteConfirm, setInviteConfirm] = useState(null);
  const [isInvited, setIsInvited] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportDrawer, setShowReportDrawer] = useState(false);
  const [reportConfirm, setReportConfirm] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Load crew profile
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("crew_profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setProfile(data);
      setLoading(false);
    }
    load();
  }, [id]);

  // Check if already favorited
  useEffect(() => {
    if (!user) return;
    async function checkFavorite() {
      const { data } = await supabase
        .from("boat_favorites")
        .select("id")
        .eq("boat_owner_id", user.id)
        .eq("crew_id", id)
        .maybeSingle();
      setIsFavorited(!!data);
    }
    checkFavorite();
  }, [user, id]);

  // Load boat owner's regattas for invite drawer
  useEffect(() => {
    if (!user) return;
    async function loadRegattas() {
      const [{ data }, { data: invData }] = await Promise.all([
        supabase.from("regattas").select("*, regatta_positions(*)").eq("boat_id", user.id),
        supabase.from("invitations").select("regatta_id").eq("crew_id", id),
      ]);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const future = (data || []).filter((r) => {
        if (!r.date) return true;
        const [m, d, y] = r.date.split("/");
        if (!m || !d || !y) return true;
        return new Date(`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`) >= now;
      }).sort((a, b) => {
        const parse = (s) => { if (!s) return 0; const [m,d,y] = s.split("/"); return new Date(`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`); };
        return parse(a.date) - parse(b.date);
      });
      setMyRegattas(future);
      setExistingInviteRegattaIds((invData || []).map((i) => i.regatta_id));
    }
    loadRegattas();
  }, [user]);

  async function handleFavorite() {
    if (!user || favoriteLoading) return;
    setFavoriteLoading(true);
    if (isFavorited) {
      await supabase
        .from("boat_favorites")
        .delete()
        .eq("boat_owner_id", user.id)
        .eq("crew_id", id);
      setIsFavorited(false);
    } else {
      await supabase
        .from("boat_favorites")
        .insert({ boat_owner_id: user.id, crew_id: id });
      setIsFavorited(true);
    }
    setFavoriteLoading(false);
  }

  async function handleReport(reason) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        reported_id: id,
        reported_name: profile?.name || "Unknown",
        profile_type: "crew",
        reason,
      }),
    });
    setShowReportDrawer(false);
    setReportConfirm(true);
  }

  async function handleInvite({ regatta, position }) {
    await supabase.from("invitations").insert({
      regatta_id: regatta.id,
      position_id: position.id,
      crew_id: id,
      role: position.role,
      status: "pending",
    });
    setShowInviteDrawer(false);
    setInviteConfirm({ regattaName: regatta.name, position: position.role });
    setIsInvited(true);
    localStorage.setItem("kroo_crew_regatta_notif", "1");
    // Notify crew member of invite
    notify({
      event: "new_invite",
      recipient_id: id,
      profile_type: "crew",
      position_id: position.id,
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
          <Link href="/boat/feed">
            <IconArrowLeft size={22} color="#111" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Sailor not found.</p>
        </div>
        <BoatNavFooter active="Home" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "#f5f5f5" }}>
      {showInviteDrawer && (
        <InviteDrawer
          sailorName={profile.name}
          regattas={myRegattas}
          invitedRegattaIds={existingInviteRegattaIds}
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

      {showReportDrawer && (
        <ReportDrawer
          name={profile.name}
          onSubmit={handleReport}
          onClose={() => setShowReportDrawer(false)}
        />
      )}

      {reportConfirm && <ReportConfirmModal onClose={() => setReportConfirm(false)} />}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
        <Link href="/boat/feed" className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <IconArrowLeft size={20} color="#111" />
          Back to crew feed
        </Link>
        {user?.id !== id && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu((v) => !v)} className="p-1.5 rounded-full" style={{ color: "#555" }}>
              <IconDots size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border z-50 min-w-[160px] overflow-hidden" style={{ borderColor: "#e8e8e8" }}>
                <button onClick={() => { setShowMenu(false); setShowReportDrawer(true); }} className="w-full text-left px-4 py-3 text-sm font-medium" style={{ color: "#e53e3e" }}>Report user</button>
                <button onClick={() => { setShowMenu(false); setBlocked(true); }} className="w-full text-left px-4 py-3 text-sm font-medium border-t" style={{ color: "#e53e3e", borderColor: "#f0f0f0" }}>{blocked ? "Unblock user" : "Block user"}</button>
              </div>
            )}
          </div>
        )}
      </div>

      {blocked && (
        <div className="mx-3 mb-2 px-4 py-3 rounded-2xl text-sm text-gray-700" style={{ backgroundColor: "#fff" }}>
          <p className="font-semibold mb-0.5">User blocked</p>
          <p className="text-xs text-gray-500">You won't see this user in your feed. <button onClick={() => setBlocked(false)} className="underline">Unblock</button></p>
        </div>
      )}

      <div className="overflow-y-auto flex-1">
        <div className="flex flex-col gap-3 px-3 pt-3 max-w-[800px] mx-auto w-full">

        {/* Profile card */}
        <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div className="flex gap-4 items-start">
            <div className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: 90, height: 90, backgroundColor: "#d8d8d8" }}>
              {profile.avatar_url
                ? <ZoomableImage src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                : <IconUser size={32} color="#aaa" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-gray-400 mb-0.5">{profile.location}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-[17px] font-bold text-gray-900">{profile.name}</p>
                {profile.experience_level && <p className="text-[13px] text-gray-400">{profile.experience_level}</p>}
              </div>
              {(profile.sex || profile.weight_lbs) && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {profile.sex && <span className="text-[13px] px-3 py-1 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>{profile.sex}</span>}
                  {profile.weight_lbs && <span className="text-[13px] px-3 py-1 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>{profile.weight_lbs} lbs</span>}
                </div>
              )}
              {(profile.positions || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(profile.positions || []).map((pos) => (
                    <span key={pos} className="text-[13px] px-3 py-1 rounded-md font-semibold" style={{ backgroundColor: "#111", color: "#fff" }}>{pos}</span>
                  ))}
                </div>
              )}
            </div>
            {/* Favorite star */}
            <button onClick={handleFavorite} disabled={favoriteLoading} className="p-1 flex-shrink-0">
              <IconStar size={22} color={isFavorited ? "#f5a623" : "#bbb"} fill={isFavorited ? "#f5a623" : "none"} />
            </button>
          </div>

          {/* Action buttons */}
          {user?.id !== id && (
            <div className="flex gap-2 mt-4">
              <MessageLink
                toId={id}
                href={`/boat/messages/${id}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ color: "#0161F0", borderColor: "#0161F0" }}
              >
                <IconMessage size={16} /> Message
              </MessageLink>
              <button
                onClick={() => !isInvited && setShowInviteDrawer(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: isInvited ? "#555" : "#0161F0" }}
              >
                {isInvited
                  ? <><IconCheck size={16} strokeWidth={2.5} /> Invited</>
                  : <><IconFlag size={16} /> Race Invite</>}
              </button>
            </div>
          )}
          {user?.id !== id && (
            <MessageHint toId={id} className="mt-2 text-center">You can message {profile.name?.split(" ")[0] || "this sailor"} once they apply to one of your regattas.</MessageHint>
          )}
        </div>

        {/* Boat Classes Sailed */}
        {(profile.boat_classes || []).length > 0 && (
          <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <p className="text-[13px] text-gray-400 mb-3">Boat Classes Sailed</p>
            <div className="flex flex-wrap gap-2">
              {profile.boat_classes.map((cls) => (
                <span key={cls} className="text-[14px] px-3 py-1 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>{cls}</span>
              ))}
            </div>
          </div>
        )}

        {/* About */}
        {profile.about && (
          <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <p className="text-[13px] text-gray-400 mb-2">About</p>
            <p className="text-[15px] text-gray-800 leading-relaxed">{profile.about}</p>
          </div>
        )}

        {/* Instagram / Website */}
        {(profile.instagram || profile.website) && (
          <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            {profile.instagram && (
              <a href={`https://${profile.instagram.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
                <span>🔗</span> {profile.instagram.replace(/^https?:\/\//, "")}
              </a>
            )}
            {profile.website && (
              <a href={`https://${profile.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[15px] font-semibold text-gray-900 mt-2">
                <span>🔗</span> {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        )}

        {/* Kroo History */}
        {(profile.kroo_history || []).length > 0 && (
          <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <p className="text-[13px] text-gray-400 mb-3">Kroo History</p>
            <div className="flex flex-col gap-3">
              {profile.kroo_history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] text-gray-500">{h.date}</p>
                  {h.position && <span className="text-[13px] px-2.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>{h.position}</span>}
                  {h.boat_name && <p className="text-[14px] font-bold text-gray-900">{h.boat_name}</p>}
                  {h.boat_class && <span className="text-[13px] px-2.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>{h.boat_class}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        </div>
      </div>

      <BoatNavFooter active="Home" />
    </div>
  );
}
