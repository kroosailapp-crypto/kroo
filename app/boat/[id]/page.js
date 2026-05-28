"use client";
import { useState, use, useEffect } from "react";
import Link from "next/link";
import {
  IconMessage,
  IconStar,
  IconUser,
  IconArrowLeft,
  IconAnchor,
  IconCheck,
} from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

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
          className="mt-1 w-full py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: "#0161f0" }}
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
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [appliedPositions, setAppliedPositions] = useState(new Set());
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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
          if (!da) return 1;  // no date → bottom
          if (!db) return -1;
          const aUp = da >= now;
          const bUp = db >= now;
          if (aUp && !bUp) return -1;  // upcoming before past
          if (!aUp && bUp) return 1;
          return aUp ? da - db : db - da; // upcoming: soonest first; past: most recent first
        });
        setRegattas(sorted);
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
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
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

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {showModal && (
        <ApplyModal
          boatName={profile.boat_name}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href="/crew/feed">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <p className="text-sm font-medium text-gray-800">{profile.boat_name}</p>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Boat photo + info */}
        <div className="flex gap-3.5 px-4 py-3 items-start">
          <div
            className="rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ width: 105, height: 105, backgroundColor: "#e0e0e0" }}
          >
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.boat_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <IconAnchor size={32} color="#ccc" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-gray-900 mb-0.5">
              {profile.boat_name}
            </p>
            <p className="text-xs text-gray-500 mb-1.5">{profile.home_port}</p>
            {profile.boat_class && <Tag label={profile.boat_class} />}
            <div className="flex gap-5 mt-2">
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {regattas.length}
                </p>
                <p className="text-[13px] text-gray-500">Regattas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 px-4 pb-3">
          <Link
            href={`/crew/messages/${id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#024BB9" }}
          >
            <IconMessage size={13} /> Message
          </Link>
          <button
            onClick={handleFavorite}
            disabled={favoriteLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "#024BB9" }}
          >
            <IconStar
              size={13}
              color="white"
              fill={isFavorited ? "white" : "none"}
            />
            {isFavorited ? "Unfavorite" : "Favorite"}
          </button>
        </div>

        <Divider />

        {/* About */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">About</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            {profile.about || "No description yet."}
          </p>
          {profile.website && (
            <p className="text-sm mb-1" style={{ color: "#007AFF" }}>
              {profile.website}
            </p>
          )}
          {profile.instagram && (
            <p className="text-sm" style={{ color: "#007AFF" }}>
              {profile.instagram}
            </p>
          )}
        </div>

        <Divider />

        {/* Skipper */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ width: 36, height: 36, backgroundColor: "#d8d8d8" }}
          >
            {profile.skipper_photo_url ? (
              <img
                src={profile.skipper_photo_url}
                alt={profile.skipper_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <IconUser size={18} color="#aaa" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-800">
            {profile.skipper_name}
          </p>
          <span className="text-xs text-gray-400 ml-1">· Skipper</span>
        </div>

        <Divider />

        {/* Upcoming Regattas */}
        <div className="px-4 py-3 pb-8">
          <p className="text-xs text-gray-400 mb-3">Upcoming Regattas</p>
          {regattas.length === 0 && (
            <p className="text-sm text-gray-400">No upcoming regattas.</p>
          )}
          {regattas.map((regatta) => {
            const openPositions = (regatta.regatta_positions || []).filter(
              (p) => p.status === "open"
            );
            return (
              <div key={regatta.id} className="mb-5">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">
                  {regatta.name}
                </p>
                {(regatta.date || regatta.location) && (
                  <p className="text-xs text-gray-400 mb-2">
                    {[regatta.date, regatta.location]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {openPositions.length === 0 &&
                  (regatta.regatta_positions || []).length > 0 && (
                    <p className="text-xs text-gray-400">All positions filled</p>
                  )}
                <div className="flex flex-col gap-2">
                  {openPositions.map((pos) => {
                    const applied = appliedPositions.has(pos.id);
                    return (
                      <div key={pos.id} className="flex items-center gap-2">
                        <Tag label={pos.role} />
                        {pos.level && (
                          <span className="text-[13px] text-gray-500 flex-1">
                            {pos.level}
                          </span>
                        )}
                        {applied ? (
                          <span
                            className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: "#EFF6FF",
                              color: "#0161F0",
                            }}
                          >
                            Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApply(regatta, pos)}
                            className="text-xs font-semibold px-3 py-1 rounded-full text-white flex-shrink-0"
                            style={{ backgroundColor: "#0161f0" }}
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CrewNavFooter />
    </div>
  );
}
