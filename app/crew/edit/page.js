"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconUser, IconCamera, IconAlertTriangle } from "@tabler/icons-react";
import CrewNavFooter from "@/app/components/CrewNavFooter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

function DeleteProfileModal({ onConfirm, onClose, deleting, error }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-[430px] px-5 pt-6 pb-10 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 pb-1">
          <div className="flex items-center justify-center rounded-full" style={{ width: 48, height: 48, backgroundColor: "#FEF2F2" }}>
            <IconAlertTriangle size={22} color="#DC2626" />
          </div>
          <p className="text-base font-semibold text-gray-900 text-center">Delete Sailor Profile?</p>
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            This will permanently delete your sailor profile, availability, and regatta history. This action cannot be undone.
          </p>
        </div>
        {error && <p className="text-xs text-center" style={{ color: "#DC2626" }}>{error}</p>}
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: deleting ? "#ccc" : "#DC2626" }}
        >
          {deleting ? "Deleting…" : "Yes, Delete Profile"}
        </button>
        <button
          onClick={onClose}
          disabled={deleting}
          className="w-full py-3 rounded-full text-sm font-semibold border"
          style={{ color: "#111", borderColor: "#e0e0e0" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const POSITIONS = [
  "Helm", "Tactician", "Navigator", "Mainsail Trimmer",
  "Jib Trimmer", "Spin Trimmer", "Foredeck", "Bow",
  "Pitman", "Grinder", "Mast", "Runner",
];

const LEVELS = ["Entry Level", "Mid-Level", "Advanced"];

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

export default function EditCrewProfile() {
  const router = useRouter();
  const { user, boatProfile, signOut, refreshProfiles } = useAuth();
  const fileRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [positions, setPositions] = useState([]);
  const [level, setLevel] = useState("Mid-Level");
  const [sex, setSex] = useState("");
  const [weight, setWeight] = useState("");
  const [about, setAbout] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.push("/crew/login"); return; }
    loadProfile();
  }, [user]);

  async function loadProfile() {
    const { data } = await supabase.from("crew_profiles").select("*").eq("id", user.id).single();
    if (data) {
      setName(data.name || "");
      setLocation(data.location || "");
      setPositions(data.positions || []);
      setLevel(data.experience_level || "Mid-Level");
      setSex(data.sex || "");
      setWeight(data.weight_lbs ? String(data.weight_lbs) : "");
      setAbout(data.about || "");
      setWebsite(data.website || "");
      setInstagram(data.instagram || "");
      if (data.avatar_url) setPhoto(data.avatar_url);
    }
    setLoading(false);
  }

  function togglePosition(pos) {
    if (pos === "All Positions") {
      setPositions((prev) => prev.includes("All Positions") ? [] : ["All Positions"]);
    } else {
      setPositions((prev) => {
        const without = prev.filter((p) => p !== "All Positions");
        return without.includes(pos) ? without.filter((p) => p !== pos) : [...without, pos];
      });
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhoto(URL.createObjectURL(file));
    }
  }

  async function handleDeleteProfile() {
    if (!user) return;
    setDeleting(true);
    setDeleteError("");
    try {
      // Remove all invitations sent by this crew member
      const { error: invErr } = await supabase
        .from("invitations")
        .delete()
        .eq("crew_id", user.id);
      if (invErr) throw new Error("Could not remove invitations: " + invErr.message);

      // Delete the crew profile
      const { error: profErr, count } = await supabase
        .from("crew_profiles")
        .delete({ count: "exact" })
        .eq("id", user.id);
      if (profErr) throw new Error("Could not delete profile: " + profErr.message);
      if (count === 0) throw new Error("Delete was blocked — check Supabase RLS DELETE policies for crew_profiles.");

      // If user has a boat profile, stay logged in and redirect there
      if (boatProfile) {
        await refreshProfiles();
        router.push("/boat/profile");
      } else {
        // No other profile — sign out and go home
        await signOut();
        router.push("/");
      }
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setUploadError("");
    let avatar_url = photo && !photoFile ? photo : null;

    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `crew/${user.id}.${ext}`;
      const { error: storageError } = await supabase.storage
        .from("profile-photos")
        .upload(path, photoFile, { upsert: true });
      if (storageError) {
        setUploadError("Photo upload failed: " + storageError.message);
        setSaving(false);
        return;
      }
      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      avatar_url = data.publicUrl;
    }

    const update = {
      name, location, positions, experience_level: level,
      sex: sex || null,
      weight_lbs: weight ? parseInt(weight, 10) : null,
      about, website, instagram,
    };
    if (avatar_url) update.avatar_url = avatar_url;

    const { error: updateError } = await supabase.from("crew_profiles").update(update).eq("id", user.id);
    if (updateError) {
      setUploadError("Save failed: " + updateError.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    router.push("/crew/profile");
  }

  if (loading || user === undefined) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-gray-400">Loading…</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {showDeleteModal && (
        <DeleteProfileModal
          onConfirm={handleDeleteProfile}
          onClose={() => { setShowDeleteModal(false); setDeleteError(""); }}
          deleting={deleting}
          error={deleteError}
        />
      )}
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#e8e8e8" }}>
        <Link href="/crew/profile"><IconArrowLeft size={22} color="#111" /></Link>
        <p className="flex-1 text-sm font-semibold text-gray-900">Edit Profile</p>
        <button onClick={handleSave} disabled={saving} className="text-sm font-semibold" style={{ color: "#0161F0" }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pb-8">
        {/* Photo upload */}
        <div className="flex flex-col items-center py-6 gap-2">
          <div className="relative">
            <div className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ width: 96, height: 96, backgroundColor: "#d8d8d8" }}>
              {photo ? <img src={photo} alt="Profile" className="w-full h-full object-cover" /> : <IconUser size={32} color="#aaa" />}
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 flex items-center justify-center rounded-full" style={{ width: 28, height: 28, backgroundColor: "#0161F0", border: "2px solid #fff" }}>
              <IconCamera size={14} color="white" />
            </button>
          </div>
          <button onClick={() => fileRef.current?.click()} className="text-xs font-medium" style={{ color: "#0161F0" }}>Change photo</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          {uploadError && <p className="text-xs text-center px-4" style={{ color: "#e00" }}>{uploadError}</p>}
        </div>

        <Divider />

        {/* Name */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-1.5">Name</p>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none" style={{ borderColor: "#e0e0e0" }} />
        </div>

        <Divider />

        {/* Location */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-1.5">Location</p>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
        </div>

        <Divider />

        {/* Positions */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-3">Positions</p>
          <div className="flex flex-wrap gap-2">
            {["All Positions", ...POSITIONS].map((pos) => {
              const selected = positions.includes(pos);
              return (
                <button key={pos} onClick={() => togglePosition(pos)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ backgroundColor: selected ? "#111" : "#F4F4F4", color: selected ? "#fff" : "#111", borderColor: selected ? "#111" : "#F4F4F4" }}>
                  {pos}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Experience level */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-3">Experience Level</p>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)} className="flex-1 py-2 rounded-xl text-xs font-semibold border" style={{ backgroundColor: level === l ? "#111" : "#F4F4F4", color: level === l ? "#fff" : "#111", borderColor: level === l ? "#111" : "#F4F4F4" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Sex */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-3">Sex</p>
          <div className="flex gap-2">
            {["Male", "Female"].map((s) => (
              <button
                key={s}
                onClick={() => setSex(sex === s ? "" : s)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border"
                style={{
                  backgroundColor: sex === s ? "#111" : "#F4F4F4",
                  color: sex === s ? "#fff" : "#111",
                  borderColor: sex === s ? "#111" : "#F4F4F4",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Weight */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-1.5">Weight</p>
          <div className="flex items-center gap-2">
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="e.g. 175"
              className="flex-1 px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
              style={{ borderColor: "#e0e0e0" }}
            />
            <span className="text-sm text-gray-400 font-medium flex-shrink-0">lbs</span>
          </div>
        </div>

        <Divider />

        {/* About */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-1.5">About</p>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} placeholder="Tell boats about yourself…" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400 resize-none" style={{ borderColor: "#e0e0e0" }} />
        </div>

        <Divider />

        {/* Links */}
        <div className="px-4 py-4 flex flex-col gap-3">
          <p className="text-xs text-gray-400">Links</p>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Website</p>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.yoursite.com" inputMode="url" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Instagram</p>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="instagram.com/yourhandle" inputMode="url" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
          </div>
        </div>

        <Divider />

        <div className="px-4 pt-5">
          <button onClick={handleSave} disabled={saving} className="w-full py-3.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#0161F0" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="h-px w-full mb-6" style={{ backgroundColor: "#e8e8e8" }} />
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-3.5 rounded-full text-sm font-semibold border"
            style={{ color: "#DC2626", borderColor: "#FCA5A5" }}
          >
            Delete Sailor Profile
          </button>
        </div>
      </div>

      <CrewNavFooter active="Profile" />
    </div>
  );
}
