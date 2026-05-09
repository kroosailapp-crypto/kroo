"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCamera,
  IconAnchor,
} from "@tabler/icons-react";
import BoatNavFooter from "@/app/components/BoatNavFooter";

function Divider() {
  return <div className="h-px w-full" style={{ backgroundColor: "#e8e8e8" }} />;
}

function Field({ label, placeholder, value, onChange, inputMode }) {
  return (
    <div className="px-4 py-4">
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
        style={{ borderColor: "#e0e0e0" }}
      />
    </div>
  );
}

export default function EditBoatProfile() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [skipperName, setSkipperName] = useState("Your Name");
  const [boatName, setBoatName] = useState("Boat Name");
  const [location, setLocation] = useState("San Francisco, CA");
  const [boatClass, setBoatClass] = useState("Boat Class");
  const [about, setAbout] = useState(
    "Add a description of your boat — your racing history, what kind of crew you're looking for, and what makes sailing with you special."
  );
  const [website, setWebsite] = useState("www.boatlink.com");
  const [instagram, setInstagram] = useState("instagram.com/boatname");

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  }

  function handleSave() {
    router.push("/boat/profile");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-4 pb-3 border-b flex-shrink-0"
        style={{ borderColor: "#e8e8e8" }}
      >
        <Link href="/boat/profile">
          <IconArrowLeft size={22} color="#111" />
        </Link>
        <p className="flex-1 text-sm font-semibold text-gray-900">Edit Boat Profile</p>
        <button
          onClick={handleSave}
          className="text-sm font-semibold"
          style={{ color: "#0161F0" }}
        >
          Save
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pb-8">

        {/* Boat photo upload */}
        <div className="flex flex-col items-center py-6 gap-2">
          <div className="relative">
            <div
              className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ width: 105, height: 105, backgroundColor: "#e0e0e0" }}
            >
              {photo ? (
                <img src={photo} alt="Boat" className="w-full h-full object-cover" />
              ) : (
                <IconAnchor size={32} color="#bbb" />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 flex items-center justify-center rounded-full"
              style={{ width: 28, height: 28, backgroundColor: "#0161F0", border: "2px solid #fff" }}
            >
              <IconCamera size={14} color="white" />
            </button>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs font-medium"
            style={{ color: "#0161F0" }}
          >
            Change photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <Divider />

        <Field
          label="Skipper Name"
          placeholder="Your full name"
          value={skipperName}
          onChange={setSkipperName}
        />

        <Divider />

        <Field
          label="Boat Name"
          placeholder="e.g. Dilema"
          value={boatName}
          onChange={setBoatName}
        />

        <Divider />

        <Field
          label="Location"
          placeholder="City, State"
          value={location}
          onChange={setLocation}
        />

        <Divider />

        <Field
          label="Boat Class"
          placeholder="e.g. Melges 24"
          value={boatClass}
          onChange={setBoatClass}
        />

        <Divider />

        {/* About */}
        <div className="px-4 py-4">
          <p className="text-xs text-gray-400 mb-1.5">About</p>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            placeholder="Tell sailors about your boat…"
            className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400 resize-none"
            style={{ borderColor: "#e0e0e0" }}
          />
        </div>

        <Divider />

        {/* Links */}
        <div className="px-4 py-4 flex flex-col gap-3">
          <p className="text-xs text-gray-400">Links</p>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Website</p>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="www.yourboat.com"
              inputMode="url"
              className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
              style={{ borderColor: "#e0e0e0" }}
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Instagram</p>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="instagram.com/yourboat"
              inputMode="url"
              className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 border outline-none placeholder-gray-400"
              style={{ borderColor: "#e0e0e0" }}
            />
          </div>
        </div>

        <Divider />

        {/* Save button */}
        <div className="px-4 pt-5">
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#0161F0" }}
          >
            Save Changes
          </button>
        </div>

      </div>

      <BoatNavFooter active="Profile" />
    </div>
  );
}
