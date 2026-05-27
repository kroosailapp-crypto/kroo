"use client";
import { useState, use, useEffect } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconUser,
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
      className="px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
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
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">
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

export default function CrewRegattaDetail({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [regatta, setRegatta] = useState(null);
  const [boatProfile, setBoatProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedBoat, setAppliedBoat] = useState(null);
  const [appliedPositions, setAppliedPositions] = useState(new Set());

  useEffect(() => {
    async function load() {
      const { data: reg } = await supabase
        .from("regattas")
        .select("*, regatta_positions(*)")
        .eq("id", id)
        .single();
      if (reg) {
        setRegatta(reg);
        const { data: boat } = await supabase
          .from("boat_profiles")
          .select("boat_name, home_port, skipper_name")
          .eq("id", reg.boat_id)
          .single();
        if (boat) setBoatProfile(boat);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("invitations")
      .select("position_id")
      .eq("crew_id", user.id)
      .in("status", ["applied", "accepted"])
      .then(({ data }) => {
        if (data) setAppliedPositions(new Set(data.map((r) => r.position_id)));
      });
  }, [user]);

  async function handleApply(pos) {
    if (!user) return;
    setAppliedPositions((prev) => new Set(prev).add(pos.id));
    setAppliedBoat(boatProfile?.boat_name || "this boat");
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

  if (!regatta) {
    return (
      <div className="flex flex-col min-h-screen bg-white pb-20">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Link href="/crew/regattas">
            <IconArrowLeft size={22} color="#111" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Regatta not found.</p>
        </div>
        <CrewNavFooter active="Regattas" />
      </div>
    );
  }

  const positions = regatta.regatta_positions || [];

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {appliedBoat && (
        <ApplyModal
          boatName={appliedBoat}
          onClose={() => setAppliedBoat(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href="/crew/regattas">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <p className="text-sm font-medium text-gray-800">{regatta.name}</p>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Regatta info */}
        <div className="px-4 pt-2 pb-4">
          {(regatta.date || regatta.location) && (
            <p className="text-xs text-gray-400 mb-0.5">
              {[regatta.date, regatta.location].filter(Boolean).join(", ")}
            </p>
          )}
          <p className="text-xl font-bold text-gray-900">{regatta.name}</p>
          {boatProfile && (
            <p className="text-xs text-gray-500 mt-1">
              {boatProfile.boat_name}
              {boatProfile.skipper_name ? ` · ${boatProfile.skipper_name}` : ""}
            </p>
          )}
        </div>

        <Divider />

        {/* Positions */}
        {positions.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-4">
            No positions listed for this regatta.
          </p>
        )}

        {positions.map((pos) => (
          <div key={pos.id}>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Tag label={pos.role} />
                {pos.level && (
                  <span className="text-xs text-gray-500 flex-1">{pos.level}</span>
                )}
                {pos.status === "open" ? (
                  appliedPositions.has(pos.id) ? (
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "#EFF6FF", color: "#0161F0" }}
                    >
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(pos)}
                      className="text-xs font-semibold px-4 py-1.5 rounded-full text-white flex-shrink-0"
                      style={{ backgroundColor: "#0161f0" }}
                    >
                      Apply
                    </button>
                  )
                ) : (
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 22, height: 22, backgroundColor: "#111" }}
                  >
                    <IconCheck size={13} color="white" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </div>
            <Divider />
          </div>
        ))}
      </div>

      <CrewNavFooter active="Regattas" />
    </div>
  );
}
