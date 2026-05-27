"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconCamera, IconAnchor, IconUser, IconAlertTriangle } from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";
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
          <p className="text-base font-semibold text-gray-900 text-center">Delete Boat Profile?</p>
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            This will permanently delete your boat profile and all associated regattas and positions. This action cannot be undone.
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

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function Field({ label, placeholder, value, onChange, inputMode }) {
  return (
    <div className="px-4 py-4">
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
    </div>
  );
}

export default function EditBoatProfile() {
  const router = useRouter();
  const { user, crewProfile, signOut, refreshProfiles } = useAuth();
  const fileRef = useRef(null);
  const skipperFileRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [skipperPhoto, setSkipperPhoto] = useState(null);
  const [skipperPhotoFile, setSkipperPhotoFile] = useState(null);
  const [skipperName, setSkipperName] = useState("");
  const [boatName, setBoatName] = useState("");
  const [location, setLocation] = useState("");
  const [boatClass, setBoatClass] = useState("");
  const [about, setAbout] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.push("/boat/login"); return; }
    loadProfile();
  }, [user]);

  async function loadProfile() {
    const { data } = await supabase.from("boat_profiles").select("*").eq("id", user.id).single();
    if (data) {
      setSkipperName(data.skipper_name || "");
      setBoatName(data.boat_name || "");
      setLocation(data.home_port || "");
      setBoatClass(data.boat_class || "");
      setAbout(data.about || "");
      setWebsite(data.website || "");
      setInstagram(data.instagram || "");
      if (data.photo_url) setPhoto(data.photo_url);
      if (data.skipper_photo_url) setSkipperPhoto(data.skipper_photo_url);
    }
    setLoading(false);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhoto(URL.createObjectURL(file));
    }
  }

  function handleSkipperPhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setSkipperPhotoFile(file);
      setSkipperPhoto(URL.createObjectURL(file));
    }
  }

  async function handleDeleteProfile() {
    if (!user) return;
    setDeleting(true);
    setDeleteError("");
    try {
      // Get all regatta IDs for this boat
      const { data: regattas, error: regFetchErr } = await supabase
        .from("regattas")
        .select("id")
        .eq("boat_id", user.id);
      if (regFetchErr) throw new Error("Could not fetch regattas: " + regFetchErr.message);

      if (regattas && regattas.length > 0) {
        const ids = regattas.map((r) => r.id);

        // Delete invitations linked to this boat's regattas
        const { error: invErr } = await supabase
          .from("invitations")
          .delete()
          .in("regatta_id", ids);
        if (invErr) throw new Error("Could not remove invitations: " + invErr.message);

        // Delete regatta positions
        const { error: posErr } = await supabase
          .from("regatta_positions")
          .delete()
          .in("regatta_id", ids);
        if (posErr) throw new Error("Could not remove positions: " + posErr.message);

        // Delete regattas
        const { error: regErr } = await supabase
          .from("regattas")
          .delete()
          .eq("boat_id", user.id);
        if (regErr) throw new Error("Could not remove regattas: " + regErr.message);
      }

      // Delete the boat profile
      const { error: profErr, count } = await supabase
        .from("boat_profiles")
        .delete({ count: "exact" })
        .eq("id", user.id);
      if (profErr) throw new Error("Could not delete profile: " + profErr.message);
      if (count === 0) throw new Error("Delete was blocked — check Supabase RLS DELETE policies for boat_profiles.");

      // If user has a crew profile, stay logged in and redirect there
      if (crewProfile) {
        await refreshProfiles();
        router.push("/crew/profile");
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
    let photo_url = photo && !photoFile ? photo : null;

    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `boat/${user.id}.${ext}`;
      const { error: storageError } = await supabase.storage
        .from("profile-photos")
        .upload(path, photoFile, { upsert: true });
      if (storageError) {
        setUploadError("Photo upload failed: " + storageError.message);
        setSaving(false);
        return;
      }
      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      photo_url = data.publicUrl;
    }

    // Upload skipper photo if selected
    let skipper_photo_url = skipperPhoto && !skipperPhotoFile ? skipperPhoto : null;
    if (skipperPhotoFile) {
      const ext = skipperPhotoFile.name.split(".").pop();
      const path = `skipper/${user.id}.${ext}`;
      const { error: skipperStorageError } = await supabase.storage
        .from("profile-photos")
        .upload(path, skipperPhotoFile, { upsert: true });
      if (skipperStorageError) {
        setUploadError("Skipper photo upload failed: " + skipperStorageError.message);
        setSaving(false);
        return;
      }
      const { data: skipperData } = supabase.storage.from("profile-photos").getPublicUrl(path);
      skipper_photo_url = skipperData.publicUrl;
    }

    const update = { skipper_name: skipperName, boat_name: boatName, home_port: location, boat_class: boatClass, about, website, instagram };
    if (photo_url) update.photo_url = photo_url;
    if (skipper_photo_url) update.skipper_photo_url = skipper_photo_url;

    await supabase.from("boat_profiles").update(update).eq("id", user.id);
    setSaving(false);
    router.push("/boat/profile");
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
        <Link href="/boat/profile"><IconArrowLeft size={22} color="#111" /></Link>
        <p className="flex-1 text-sm font-semibold text-gray-900">Edit Boat Profile</p>
        <button onClick={handleSave} disabled={saving} className="text-sm font-semibold" style={{ color: "#0161F0" }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pb-8">
        {/* Boat photo upload */}
        <div className="flex flex-col items-center py-6 gap-2">
          <div className="relative">
            <div className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 105, height: 105, backgroundColor: "#e0e0e0" }}>
              {photo ? <img src={photo} alt="Boat" className="w-full h-full object-cover" /> : <IconAnchor size={32} color="#bbb" />}
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
        <Field label="Skipper Name" placeholder="Your full name" value={skipperName} onChange={setSkipperName} />
        <Divider />

        {/* Skipper photo upload */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-3">Skipper Photo</p>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="rounded-full overflow-hidden flex items-center justify-center" style={{ width: 72, height: 72, backgroundColor: "#d8d8d8" }}>
                {skipperPhoto
                  ? <img src={skipperPhoto} alt="Skipper" className="w-full h-full object-cover" />
                  : <IconUser size={28} color="#aaa" />}
              </div>
              <button onClick={() => skipperFileRef.current?.click()} className="absolute bottom-0 right-0 flex items-center justify-center rounded-full" style={{ width: 24, height: 24, backgroundColor: "#0161F0", border: "2px solid #fff" }}>
                <IconCamera size={12} color="white" />
              </button>
            </div>
            <button onClick={() => skipperFileRef.current?.click()} className="text-xs font-medium" style={{ color: "#0161F0" }}>
              {skipperPhoto ? "Change skipper photo" : "Add skipper photo"}
            </button>
            <input ref={skipperFileRef} type="file" accept="image/*" className="hidden" onChange={handleSkipperPhotoChange} />
          </div>
        </div>

        <Divider />
        <Field label="Boat Name" placeholder="e.g. Dilema" value={boatName} onChange={setBoatName} />
        <Divider />
        <Field label="Location" placeholder="City, State" value={location} onChange={setLocation} />
        <Divider />
        <Field label="Boat Class" placeholder="e.g. Melges 24" value={boatClass} onChange={setBoatClass} />
        <Divider />

        {/* About */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-1.5">About</p>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} placeholder="Tell sailors about your boat…" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400 resize-none" style={{ borderColor: "#e0e0e0" }} />
        </div>

        <Divider />

        {/* Links */}
        <div className="px-4 py-4 flex flex-col gap-3">
          <p className="text-xs text-gray-400">Links</p>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Website</p>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.yourboat.com" inputMode="url" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Instagram</p>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="instagram.com/yourboat" inputMode="url" className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400" style={{ borderColor: "#e0e0e0" }} />
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
            Delete Boat Profile
          </button>
        </div>
      </div>

      <BoatNavFooter active="Profile" />
    </div>
  );
}
