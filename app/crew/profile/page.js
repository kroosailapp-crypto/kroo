"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconUser,
  IconSearch,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function Tag({ label, onRemove }) {
  return (
    <span
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
      style={{ backgroundColor: "#E8EDF8", color: "#111" }}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 flex-shrink-0">
          <IconX size={11} color="#666" />
        </button>
      )}
    </span>
  );
}

function formatDateStr(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

function AddAvailabilityModal({ onAdd, onClose }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const canAdd = from && to;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-10 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Add Availability</p>
          <button onClick={onClose}><IconX size={18} color="#999" /></button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1.5">From</p>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none" style={{ borderColor: "#e0e0e0" }} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">To</p>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none" style={{ borderColor: "#e0e0e0" }} />
          </div>
        </div>
        <button onClick={() => canAdd && onAdd(`${formatDateStr(from)} – ${formatDateStr(to)}`)} disabled={!canAdd} className="w-full py-3.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: canAdd ? "#0161F0" : "#c0c0c0" }}>
          Add Dates
        </button>
      </div>
    </div>
  );
}

function AddRegattaModal({ onAdd, onClose }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-10 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Add Regatta</p>
          <button onClick={onClose}><IconX size={18} color="#999" /></button>
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2026 Rolex Big Boat Series" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} autoFocus />
        <button onClick={() => name.trim() && onAdd(name.trim())} disabled={!name.trim()} className="w-full py-3.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: name.trim() ? "#0161F0" : "#c0c0c0" }}>
          Add Regatta
        </button>
      </div>
    </div>
  );
}

const BOAT_CLASSES = ["Melges 24","J/24","J/70","J/105","Snipe","470","Laser","Etchells","Farr 40","Swan 42","Finn","49er","Nacra 17","Lightning","Flying Dutchman","Optimist","RS200","Sunfish"];

function AddClassModal({ existing, onAdd, onClose }) {
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState("");
  const toAdd = custom.trim() || selected;
  const available = BOAT_CLASSES.filter((c) => !existing.includes(c));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-10 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Add Boat Class</p>
          <button onClick={onClose}><IconX size={18} color="#999" /></button>
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {available.map((cls) => (
            <button key={cls} onClick={() => { setSelected(cls); setCustom(""); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ backgroundColor: selected === cls ? "#111" : "#F4F4F4", color: selected === cls ? "#fff" : "#111", borderColor: selected === cls ? "#111" : "#F4F4F4" }}>
              {cls}
            </button>
          ))}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1.5">Or type a class</p>
          <input value={custom} onChange={(e) => { setCustom(e.target.value); setSelected(null); }} placeholder="e.g. Transpac 52" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
        </div>
        <button onClick={() => toAdd && onAdd(toAdd)} disabled={!toAdd} className="w-full py-3.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: toAdd ? "#0161F0" : "#c0c0c0" }}>
          Add Class
        </button>
      </div>
    </div>
  );
}

export default function CrewProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [availability, setAvailability] = useState([]);
  const [regattas, setRegattas] = useState([]);
  const [classes, setClasses] = useState([]);

  const [showAvailModal, setShowAvailModal] = useState(false);
  const [showRegattaModal, setShowRegattaModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.push("/crew/login"); return; }
    loadProfile();
  }, [user]);

  async function loadProfile() {
    const { data } = await supabase.from("crew_profiles").select("*").eq("id", user.id).single();
    if (data) {
      setProfile(data);
      setAvailability(data.availability || []);
      setRegattas(data.interested_regattas || []);
      setClasses(data.boat_classes || []);
    }
    setLoading(false);
  }

  async function saveField(field, value) {
    await supabase.from("crew_profiles").update({ [field]: value }).eq("id", user.id);
  }

  async function addAvailability(date) {
    const next = [...availability, date];
    setAvailability(next);
    setShowAvailModal(false);
    saveField("availability", next);
  }

  async function removeAvailability(i) {
    const next = availability.filter((_, j) => j !== i);
    setAvailability(next);
    saveField("availability", next);
  }

  async function addRegatta(r) {
    const next = [...regattas, r];
    setRegattas(next);
    setShowRegattaModal(false);
    saveField("interested_regattas", next);
  }

  async function removeRegatta(i) {
    const next = regattas.filter((_, j) => j !== i);
    setRegattas(next);
    saveField("interested_regattas", next);
  }

  async function addClass(c) {
    const next = [...classes, c];
    setClasses(next);
    setShowClassModal(false);
    saveField("boat_classes", next);
  }

  async function removeClass(i) {
    const next = classes.filter((_, j) => j !== i);
    setClasses(next);
    saveField("boat_classes", next);
  }

  if (loading || user === undefined) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {showAvailModal && <AddAvailabilityModal onAdd={addAvailability} onClose={() => setShowAvailModal(false)} />}
      {showRegattaModal && <AddRegattaModal onAdd={addRegatta} onClose={() => setShowRegattaModal(false)} />}
      {showClassModal && <AddClassModal existing={classes} onAdd={addClass} onClose={() => setShowClassModal(false)} />}

      {/* App Bar */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={52} height={20} />
        <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-400" style={{ backgroundColor: "#f0f0f0" }}>
          <IconSearch size={14} color="#aaa" />
          <span>Search</span>
        </div>
        <IconPlus size={22} color="#111" />
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Avatar + Info */}
        <div className="flex gap-3.5 px-4 py-3 items-start">
          <div className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: 105, height: 105, backgroundColor: "#d8d8d8" }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              : <IconUser size={32} color="#aaa" />}
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold mb-0.5 text-gray-900">{profile?.name || "—"}</p>
            <p className="text-xs text-gray-500 mb-2">{profile?.location || "—"}</p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {(profile?.positions || []).map((p) => <Tag key={p} label={p} />)}
            </div>
            <p className="text-xs text-gray-400 mb-2.5">{profile?.experience_level || ""}</p>
            <div className="flex gap-5">
              <div><p className="text-base font-semibold text-gray-900">0</p><p className="text-[11px] text-gray-500">Kroo</p></div>
              <div><p className="text-base font-semibold text-gray-900">0</p><p className="text-[11px] text-gray-500">Favorites</p></div>
              <div><p className="text-base font-semibold text-gray-900">0</p><p className="text-[11px] text-gray-500">Following</p></div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-3">
          <Link href="/crew/edit" className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium border" style={{ color: "#0161f0", borderColor: "#0161f0" }}>
            Edit Profile
          </Link>
        </div>

        <Divider />

        {/* Availability */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Availability</p>
          {availability.map((date, i) => (
            <div key={i} className="flex items-center justify-between mb-1.5">
              <p className="text-sm text-gray-800">{date}</p>
              <button onClick={() => removeAvailability(i)} className="ml-3 flex-shrink-0"><IconX size={14} color="#bbb" /></button>
            </div>
          ))}
          <button onClick={() => setShowAvailModal(true)} className="mt-1 text-xs font-medium" style={{ color: "#0161f0" }}>+ Add Availability</button>
        </div>

        <Divider />

        {/* Interested Regattas */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Interested Regattas</p>
          {regattas.map((r, i) => (
            <div key={i} className="flex items-center justify-between mb-1.5">
              <p className="text-sm text-gray-800">{r}</p>
              <button onClick={() => removeRegatta(i)} className="ml-3 flex-shrink-0"><IconX size={14} color="#bbb" /></button>
            </div>
          ))}
          <button onClick={() => setShowRegattaModal(true)} className="mt-1 text-xs font-medium" style={{ color: "#0161f0" }}>+ Add Regatta</button>
        </div>

        <Divider />

        {/* Boat Classes */}
        <div className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-2">Boat Classes Sailed</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {classes.map((cls, i) => (
              <Tag key={i} label={cls} onRemove={() => removeClass(i)} />
            ))}
          </div>
          <button onClick={() => setShowClassModal(true)} className="mt-1 text-xs font-medium" style={{ color: "#0161f0" }}>+ Add Class</button>
        </div>

        <Divider />

        {/* About */}
        <div className="px-4 py-3 pb-6">
          <p className="text-xs text-gray-400 mb-2">About</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            {profile?.about || "Add a bio to tell boats about yourself."}
          </p>
          {profile?.website && <p className="text-sm" style={{ color: "#007AFF" }}>{profile.website}</p>}
        </div>

        <div className="px-4 pb-8">
          <Link href="/crew/feed" className="w-full flex items-center justify-center py-3 rounded-full font-medium text-sm" style={{ backgroundColor: "#0161f0", color: "#fff" }}>
            Browse Boats →
          </Link>
        </div>
      </div>

      <CrewNavFooter active="Profile" />
    </div>
  );
}
