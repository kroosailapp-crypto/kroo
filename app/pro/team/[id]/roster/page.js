"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTeam } from "../layout";
import { IconUserPlus, IconX, IconMail, IconPhone, IconChevronDown } from "@tabler/icons-react";

const ROLES = ["manager", "sailor", "shore_crew"];
const ROLE_LABEL = { owner: "Owner", manager: "Manager", sailor: "Sailor", shore_crew: "Shore Crew" };
const ROLE_COLOR = { owner: "#02123e", manager: "#0161f0", sailor: "#39e75f", shore_crew: "#f59e0b" };

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function InviteModal({ teamId, onClose, onSent }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("sailor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleInvite() {
    setError("");
    setLoading(true);
    const { error: err } = await supabase.from("pro_invitations").insert({ team_id: teamId, email, role });
    if (err) { setError(err.message); setLoading(false); return; }

    // Send invite email via API
    await fetch("/api/pro/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, email, role }),
    });

    setLoading(false);
    onSent?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md px-5 pt-6 pb-10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Invite crew member</h3>
          <button onClick={onClose}><IconX size={20} className="text-gray-400" /></button>
        </div>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          inputMode="email"
          className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border"
          style={{ borderColor: "#e5e5e5" }}
        />
        <div className="relative">
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border appearance-none bg-white"
            style={{ borderColor: "#e5e5e5" }}
          >
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="text-xs" style={{ color: "#e00" }}>{error}</p>}
        <button
          onClick={handleInvite}
          disabled={!email || loading}
          className="w-full py-3 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: !email || loading ? "#ccc" : "#0161f0" }}
        >
          {loading ? "Sending…" : "Send invitation"}
        </button>
      </div>
    </div>
  );
}

function MemberSheet({ member: m, isManager, onClose, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(m.name || "");
  const [position, setPosition] = useState(m.position || "");
  const [sex, setSex] = useState(m.sex || "");
  const [weight, setWeight] = useState(m.weight_kg || "");
  const [shoe, setShoe] = useState(m.shoe_size || "");
  const [shirt, setShirt] = useState(m.shirt_size || "");
  const [pants, setPants] = useState(m.pants_size || "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const { data } = await supabase
      .from("pro_team_members")
      .update({ name, position, sex, weight_kg: weight || null, shoe_size: shoe, shirt_size: shirt, pants_size: pants })
      .eq("id", m.id)
      .select()
      .single();
    setLoading(false);
    onUpdate?.(data);
    setEditing(false);
  }

  async function handleRemove() {
    if (!confirm(`Remove ${m.name} from the team?`)) return;
    await supabase.from("pro_team_members").delete().eq("id", m.id);
    onRemove?.(m.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md px-5 pt-6 pb-10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {m.photo_url
              ? <img src={m.photo_url} className="w-10 h-10 rounded-full object-cover" alt={m.name} />
              : <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#0161f0" }}>{(m.name || m.email)[0].toUpperCase()}</div>
            }
            <div>
              <p className="font-semibold text-gray-900">{m.name || m.email}</p>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: `${ROLE_COLOR[m.role]}15`, color: ROLE_COLOR[m.role] }}>{ROLE_LABEL[m.role]}</span>
            </div>
          </div>
          <button onClick={onClose}><IconX size={20} className="text-gray-400" /></button>
        </div>

        {!editing ? (
          <>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {m.email && <div className="flex items-center gap-2"><IconMail size={16} className="text-gray-400" />{m.email}</div>}
              {m.phone && <div className="flex items-center gap-2"><IconPhone size={16} className="text-gray-400" />{m.phone}</div>}
              {m.position && <p><span className="text-gray-400">Position:</span> {m.position}</p>}
              {m.sex && <p><span className="text-gray-400">Sex:</span> {m.sex}</p>}
              {m.weight_kg && <p><span className="text-gray-400">Weight:</span> {m.weight_kg} kg</p>}
              {(m.shoe_size || m.shirt_size || m.pants_size) && (
                <p><span className="text-gray-400">Gear:</span> Shoe {m.shoe_size} · Shirt {m.shirt_size} · Pants {m.pants_size}</p>
              )}
            </div>
            {isManager && m.role !== "owner" && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => setEditing(true)} className="flex-1 py-2.5 rounded-full text-sm font-semibold border" style={{ borderColor: "#0161f0", color: "#0161f0" }}>Edit</button>
                <button onClick={handleRemove} className="flex-1 py-2.5 rounded-full text-sm font-semibold" style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}>Remove</button>
              </div>
            )}
          </>
        ) : (
          <>
            {[
              { label: "Name", value: name, set: setName },
              { label: "Position", value: position, set: setPosition },
            ].map(f => (
              <div key={f.label} className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 uppercase tracking-wide">{f.label}</label>
                <input className="border rounded-xl px-4 py-2.5 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} value={f.value} onChange={e => f.set(e.target.value)} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase tracking-wide">Sex</label>
              <div className="flex gap-2">
                {["Male", "Female", "Other"].map(s => (
                  <button key={s} onClick={() => setSex(s)} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ backgroundColor: sex === s ? "#0161f0" : "#fff", color: sex === s ? "#fff" : "#0161f0", borderColor: "#0161f0" }}>{s}</button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase tracking-wide">Weight (kg)</label>
              <input className="border rounded-xl px-4 py-2.5 text-sm outline-none" style={{ borderColor: "#e5e5e5" }} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            {[
              { label: "Shoe size", value: shoe, set: setShoe, opts: ["36","37","38","39","40","41","42","43","44","45","46","47","48"] },
              { label: "Shirt size", value: shirt, set: setShirt, opts: SIZES },
              { label: "Pants size", value: pants, set: setPants, opts: SIZES },
            ].map(f => (
              <div key={f.label} className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 uppercase tracking-wide">{f.label}</label>
                <div className="flex flex-wrap gap-1.5">
                  {f.opts.map(o => (
                    <button key={o} onClick={() => f.set(o)} className="px-2.5 py-1 rounded-md text-xs font-medium border" style={{ backgroundColor: f.value === o ? "#0161f0" : "#fff", color: f.value === o ? "#fff" : "#555", borderColor: f.value === o ? "#0161f0" : "#e5e5e5" }}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-full text-sm font-medium border" style={{ borderColor: "#e5e5e5", color: "#555" }}>Cancel</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#0161f0" }}>{loading ? "Saving…" : "Save"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RosterPage() {
  const { id } = useParams();
  const { member: currentMember } = useTeam();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const isManager = currentMember.role === "owner" || currentMember.role === "manager";

  useEffect(() => {
    supabase.from("pro_team_members").select("*").eq("team_id", id).order("role").then(({ data }) => {
      setMembers(data || []);
      setLoading(false);
    });
  }, [id]);

  const FILTERS = ["all", "manager", "sailor", "shore_crew"];
  const filtered = filter === "all" ? members : members.filter(m => m.role === filter);

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl">
      {showInvite && <InviteModal teamId={id} onClose={() => setShowInvite(false)} />}
      {selected && (
        <MemberSheet
          member={selected}
          isManager={isManager}
          onClose={() => setSelected(null)}
          onUpdate={updated => setMembers(ms => ms.map(m => m.id === updated.id ? updated : m))}
          onRemove={rid => setMembers(ms => ms.filter(m => m.id !== rid))}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: "#02123e" }}>Roster <span className="text-gray-400 font-normal text-base">({members.length})</span></h1>
        {isManager && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#0161f0" }}
          >
            <IconUserPlus size={16} /> Invite
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 capitalize"
            style={{
              backgroundColor: filter === f ? "#0161f0" : "#fff",
              color: filter === f ? "#fff" : "#555",
              border: filter === f ? "none" : "1px solid #e5e5e5",
            }}
          >
            {f === "all" ? "All" : f === "shore_crew" ? "Shore Crew" : ROLE_LABEL[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0161f0", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(m => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className="bg-white rounded-xl p-3 border flex items-center gap-3 w-full text-left hover:shadow-sm transition-shadow"
              style={{ borderColor: "#e5e5e5" }}
            >
              {m.photo_url
                ? <img src={m.photo_url} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt={m.name} />
                : <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: "#0161f0" }}>{(m.name || m.email)[0].toUpperCase()}</div>
              }
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{m.name || m.email}</p>
                <p className="text-xs text-gray-400 truncate">{m.position || m.email}</p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md flex-shrink-0" style={{ backgroundColor: `${ROLE_COLOR[m.role]}15`, color: ROLE_COLOR[m.role] }}>
                {ROLE_LABEL[m.role]}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-12">No members in this category</p>
          )}
        </div>
      )}
    </div>
  );
}
