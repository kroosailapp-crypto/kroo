"use client";
import { useState, useEffect, useRef } from "react";
import ProfileSwitcher from "@/app/components/ProfileSwitcher";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconUser, IconX, IconDotsVertical } from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useProfileSharing } from "@/lib/use-profile-sharing";
import { ShareProfileUI, ShareProfileButton, PublicProfileToggle } from "@/app/components/ShareProfileUI";

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
          <Link href="/notifications?from=crew" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50">
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
            Delete Sailor Profile
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

const BOAT_CLASSES = ["Melges 24","J/24","J/70","J/105","Snipe","470","Laser","Etchells","Farr 40","Swan 42","Finn","49er","Nacra 17","Lightning","Flying Dutchman","Optimist","RS200","Sunfish"];
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
            <button key={cls} onClick={() => { setSelected(cls); setCustom(""); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ backgroundColor: selected === cls ? "#111" : "#F4F4F4", color: selected === cls ? "#fff" : "#111", borderColor: selected === cls ? "#111" : "#F4F4F4" }}>
              {cls}
            </button>
          ))}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1.5">Or type a class</p>
          <input value={custom} onChange={(e) => { setCustom(e.target.value); setSelected(null); }} placeholder="e.g. Transpac 52"
            className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
        </div>
        <button onClick={() => toAdd && onAdd(toAdd)} disabled={!toAdd} className="w-full lg:w-auto py-3.5 rounded-2xl text-sm font-semibold text-white"
          style={{ backgroundColor: toAdd ? "#0161F0" : "#c0c0c0" }}>
          Add Class
        </button>
      </div>
    </div>
  );
}

function DeleteProfileModal({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl px-6 py-7 w-full max-w-[320px] flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-base font-semibold text-gray-900 text-center leading-snug">Delete Sailor Profile?</p>
        <p className="text-xs text-gray-400 text-center -mt-2">Your sailing profile, applications, and messages will be permanently deleted. This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold border" style={{ color: "#111", borderColor: "#d0d0d0" }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: "#e00" }}>Delete</button>
        </div>
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const sharing = useProfileSharing({
    kind: "crew",
    id: user?.id,
    name: profile?.name,
    isPublic: !!profile?.is_public,
    onPublicChange: (v) => setProfile((p) => ({ ...p, is_public: v })),
  });

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

  async function handleDeleteProfile() {
    setShowDeleteModal(false);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/profile/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ profileType: "crew" }),
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

  const krooHistory = profile?.kroo_history || [];

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "#f5f5f5" }}>
      {showDeleteModal && <DeleteProfileModal onConfirm={handleDeleteProfile} onClose={() => setShowDeleteModal(false)} />}
      <ShareProfileUI sharing={sharing} kind="crew" name={profile?.name} />
      {showClassModal && <AddClassModal existing={classes} onAdd={addClass} onClose={() => setShowClassModal(false)} />}

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
            <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 90, height: 90, backgroundColor: "#d8d8d8" }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                : <IconUser size={32} color="#aaa" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-gray-400 mb-0.5">{profile?.location}</p>
              <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                <p className="text-[17px] font-bold text-gray-900">{profile?.name || "—"}</p>
                {profile?.experience_level && (
                  <p className="text-[13px] text-gray-400">{profile.experience_level}</p>
                )}
              </div>
              {(profile?.sex || profile?.weight_lbs) && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {profile.sex && (
                    <span className="text-[13px] px-3 py-1 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>{profile.sex}</span>
                  )}
                  {profile.weight_lbs && (
                    <span className="text-[13px] px-3 py-1 rounded-md font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>{profile.weight_lbs} lbs</span>
                  )}
                </div>
              )}
              {(profile?.positions || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(profile.positions || []).map((pos) => (
                    <span key={pos} className="text-[13px] px-3 py-1 rounded-md font-semibold" style={{ backgroundColor: "#111", color: "#fff" }}>{pos}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile */}
          <Link
            href="/crew/edit"
            className="mt-4 flex items-center justify-center py-2.5 rounded-xl text-[15px] font-semibold border"
            style={{ color: "#0161F0", borderColor: "#0161F0" }}
          >
            Edit Profile
          </Link>

          {/* Share profile */}
          <ShareProfileButton onClick={sharing.share} className="mt-2 w-full py-2.5 rounded-xl" />
        </div>

        {/* Boat Classes Sailed */}
        <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <p className="text-[13px] text-gray-400 mb-3">Boat Classes Sailed</p>
          <div className="flex flex-wrap gap-2">
            {classes.map((cls, i) => (
              <span key={i} className="flex items-center gap-1 text-[14px] px-3 py-1 rounded-full font-medium" style={{ backgroundColor: "#f0f2f5", color: "#444" }}>
                {cls}
                <button onClick={() => removeClass(i)} className="ml-0.5 flex-shrink-0">
                  <IconX size={11} color="#888" />
                </button>
              </span>
            ))}
          </div>
          {classes.length < MAX_CLASSES
            ? <button onClick={() => setShowClassModal(true)} className="mt-3 text-[14px] font-semibold" style={{ color: "#0161F0" }}>+ Add Class</button>
            : <p className="mt-3 text-[13px] text-gray-400">Maximum of {MAX_CLASSES} classes reached</p>
          }
        </div>

        {/* About */}
        {profile?.about && (
          <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <p className="text-[13px] text-gray-400 mb-2">About</p>
            <p className="text-[15px] text-gray-800 leading-relaxed">{profile.about}</p>
          </div>
        )}

        {/* Instagram / Website */}
        {(profile?.instagram || profile?.website) && (
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
        {krooHistory.length > 0 && (
          <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <p className="text-[13px] text-gray-400 mb-3">Kroo History</p>
            <div className="flex flex-col gap-3">
              {krooHistory.map((h, i) => (
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

      <CrewNavFooter active="Profile" />
    </div>
  );
}
