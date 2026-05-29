"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconUser, IconX, IconDotsVertical } from "@tabler/icons-react";
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

const BOAT_CLASSES =["Melges 24","J/24","J/70","J/105","Snipe","470","Laser","Etchells","Farr 40","Swan 42","Finn","49er","Nacra 17","Lightning","Flying Dutchman","Optimist","RS200","Sunfish"];
const MAX_CLASSES = 5;

function AddClassModal({ existing, onAdd, onClose }) {
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState("");
  const toAdd = custom.trim() || selected;
  const available = BOAT_CLASSES.filter((c) => !existing.includes(c));
  const remaining = MAX_CLASSES - existing.length;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-5 pb-10 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-gray-900">Add Boat Class</p>
            <p className="text-xs text-gray-400 mt-0.5">{remaining} of {MAX_CLASSES} remaining</p>
          </div>
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
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
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
      setClasses(data.boat_classes || []);
    }
    setLoading(false);
  }

  async function saveField(field, value) {
    await supabase.from("crew_profiles").update({ [field]: value }).eq("id", user.id);
  }

  async function addClass(c) {
    if (classes.length >= MAX_CLASSES) return;
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
      {showClassModal && <AddClassModal existing={classes} onAdd={addClass} onClose={() => setShowClassModal(false)} />}

      {/* App Bar */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        <ProfileSwitcher />
        <ProfileMenu />
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
            <p className="text-xs text-gray-400 mb-1.5">{profile?.experience_level || ""}</p>
            {(profile?.sex || profile?.weight_lbs) && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {profile?.sex && <Tag label={profile.sex} />}
                {profile?.weight_lbs && <Tag label={`${profile.weight_lbs} lbs`} />}
              </div>
            )}
            <div className="flex gap-5">
              <div><p className="text-base font-semibold text-gray-900">0</p><p className="text-[13px] text-gray-500">Kroo</p></div>
              <div><p className="text-base font-semibold text-gray-900">0</p><p className="text-[13px] text-gray-500">Favorites</p></div>
              <div><p className="text-base font-semibold text-gray-900">0</p><p className="text-[13px] text-gray-500">Following</p></div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-3">
          <Link href="/crew/edit" className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium border" style={{ color: "#0161f0", borderColor: "#0161f0" }}>
            Edit Profile
          </Link>
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
          {classes.length < MAX_CLASSES
            ? <button onClick={() => setShowClassModal(true)} className="mt-1 text-xs font-medium" style={{ color: "#0161f0" }}>+ Add Class</button>
            : <p className="mt-1 text-xs text-gray-400">Maximum of {MAX_CLASSES} classes reached</p>
          }
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

      <CrewNavFooter active="Profile" />
    </div>
  );
}
