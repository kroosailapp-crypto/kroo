"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import LocationInput from "@/app/components/LocationInput";

const POSITIONS = [
  "Helm", "Tactician", "Navigator", "Mainsail Trimmer",
  "Jib Trimmer", "Spin Trimmer", "Foredeck", "Bow",
  "Pitman", "Grinder", "Mast", "Runner",
];

const EXPERIENCE_LEVELS = ["Beginner", "Mid-Level", "Advanced", "Expert"];

function ProgressBar({ step, total }) {
  return (
    <div className="flex gap-1.5 w-full mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full"
          style={{ backgroundColor: i < step ? "#0161f0" : "#e5e5e5" }}
        />
      ))}
    </div>
  );
}

function Field({ placeholder, type = "text", value, onChange, inputMode }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode={inputMode}
      className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border"
      style={{ borderColor: "#e5e5e5", backgroundColor: "#fff" }}
    />
  );
}

function NextButton({ onClick, label = "NEXT", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center px-6 py-3 rounded-full font-medium text-sm mt-6"
      style={{
        backgroundColor: disabled ? "#ccc" : "#0161f0",
        color: "#f6f6f6",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

function Tag({ label, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(label)}
      className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
      style={{
        backgroundColor: selected ? "#0161f0" : "#fff",
        color: selected ? "#fff" : "#0161f0",
        borderColor: "#0161f0",
      }}
    >
      {label}
    </button>
  );
}

export default function CrewSignupPage() {
  const router = useRouter();
  const { user, boatProfile, refreshProfiles } = useAuth();

  // isAddingProfile = user is already logged in and adding a second (crew) profile
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Steps: not logged in = 4 (account, location, experience, positions)
  //        logged in     = 3 (location+name, experience, positions) — step starts at 2 internally
  const [step, setStep] = useState(1);

  // Account fields (only used when NOT already logged in)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [positions, setPositions] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Once auth state resolves, configure flow
  useEffect(() => {
    if (user === undefined) return; // still resolving
    if (user) {
      setIsAddingProfile(true);
      setStep(2); // skip account step
      // Pre-fill from existing boat profile if available
      if (boatProfile) {
        setName(boatProfile.skipper_name || "");
        setAvatarUrl(boatProfile.skipper_photo_url || "");
      }
    }
    setAuthChecked(true);
  }, [user, boatProfile]);

  // Progress bar values
  const TOTAL_STEPS = isAddingProfile ? 3 : 4;
  const progressStep = isAddingProfile ? step - 1 : step;

  function togglePosition(pos) {
    if (pos === "All Positions") {
      // Selecting "All Positions" clears individual picks
      setPositions((prev) => prev.includes("All Positions") ? [] : ["All Positions"]);
    } else {
      // Selecting any individual position clears "All Positions"
      setPositions((prev) => {
        const without = prev.filter((p) => p !== "All Positions");
        return without.includes(pos) ? without.filter((p) => p !== pos) : [...without, pos];
      });
    }
  }

  async function handleFinish() {
    setError("");
    setLoading(true);
    try {
      let userId;

      if (isAddingProfile) {
        // Already logged in — use existing session
        userId = user.id;
      } else {
        // Create new auth user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { user_type: "crew" } },
        });
        if (signUpError) throw signUpError;

        if (signUpData.session) {
          // Email confirmation disabled — session created immediately
          userId = signUpData.user.id;
        } else {
          // Email confirmation enabled — show verification screen
          setEmailSent(true);
          setLoading(false);
          return;
        }
      }

      // Insert crew profile
      const { error: profileError } = await supabase.from("crew_profiles").insert({
        id: userId,
        name,
        location,
        experience_level: experience,
        positions,
        avatar_url: avatarUrl || "",
        about: "",
        website: "",
        instagram: "",
        availability: [],
        interested_regattas: [],
        boat_classes: [],
      });
      if (profileError) throw profileError;

      if (refreshProfiles) await refreshProfiles();
      router.push("/crew/profile");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleNext() {
    if (step < 4) setStep(step + 1);
    else handleFinish();
  }

  function handleBack() {
    const minStep = isAddingProfile ? 2 : 1;
    if (step > minStep) setStep(step - 1);
    else router.back();
  }

  // Wait until we know auth state before rendering (avoids flash of account step)
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="flex flex-col min-h-screen bg-white px-5 py-5 items-center justify-center gap-5">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={60} height={24} />
        <div className="flex flex-col items-center gap-3 text-center mt-4">
          <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, backgroundColor: "#0161f0" }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0L12 13.5 2.25 6.75" />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-900">Check your email</p>
          <p className="text-sm text-gray-500 leading-relaxed max-w-[280px]">
            We sent a confirmation link to <span className="font-semibold text-gray-800">{email}</span>. Click it to verify your account, then log in to complete your profile.
          </p>
        </div>
        <button
          onClick={() => router.push("/crew/login")}
          className="mt-4 w-full max-w-[280px] py-3 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: "#0161f0" }}
        >
          Go to Log In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-5 py-5">
      <div className="mb-6">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={60} height={24} />
      </div>

      <ProgressBar step={progressStep} total={TOTAL_STEPS} />

      {/* Step 1 — Account (only when NOT already logged in) */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">Create your account</p>
          <Field placeholder="Full Name" value={name} onChange={setName} />
          <Field placeholder="Email" type="email" inputMode="email" value={email} onChange={setEmail} />
          <Field placeholder="Password" type="password" value={password} onChange={setPassword} />
          <div>
            <Field placeholder="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
            {passwordMismatch && (
              <p className="text-xs mt-1.5 ml-1" style={{ color: "#e00" }}>Passwords don't match</p>
            )}
          </div>
          <NextButton onClick={handleNext} disabled={!name || !email || !passwordsMatch} />
        </div>
      )}

      {/* Step 2 — Location (+ Name field when adding a second profile) */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">
            {isAddingProfile ? "Create your sailor profile" : "Where are you based?"}
          </p>
          {isAddingProfile && (
            <Field placeholder="Full Name" value={name} onChange={setName} />
          )}
          <LocationInput placeholder="City, State (e.g. San Francisco, CA)" value={location} onChange={setLocation} className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none border" style={{ borderColor: "#e5e5e5", backgroundColor: "#fff" }} />
          <div className="flex flex-wrap gap-2 mt-2">
            {["San Francisco, CA", "Oakland, CA", "Sausalito, CA"].map((loc) => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className="px-3 py-1.5 rounded-full text-sm border"
                style={{
                  backgroundColor: location === loc ? "#0161f0" : "#fff",
                  color: location === loc ? "#fff" : "#0161f0",
                  borderColor: "#0161f0",
                }}
              >
                {loc}
              </button>
            ))}
          </div>
          <NextButton
            onClick={handleNext}
            disabled={!location || (isAddingProfile && !name)}
          />
        </div>
      )}

      {/* Step 3 — Experience */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">Experience level</p>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <Tag key={level} label={level} selected={experience === level} onToggle={() => setExperience(level)} />
            ))}
          </div>
          <NextButton onClick={handleNext} disabled={!experience} />
        </div>
      )}

      {/* Step 4 — Positions */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">What positions do you sail?</p>
          <div className="flex flex-wrap gap-2">
            <Tag key="All Positions" label="All Positions" selected={positions.includes("All Positions")} onToggle={togglePosition} />
            {POSITIONS.map((pos) => (
              <Tag key={pos} label={pos} selected={positions.includes(pos)} onToggle={togglePosition} />
            ))}
          </div>
          {error && <p className="text-xs" style={{ color: "#e00" }}>{error}</p>}
          <NextButton
            onClick={handleNext}
            label={loading ? "Creating profile…" : "CREATE PROFILE"}
            disabled={positions.length === 0 || loading}
          />
        </div>
      )}

      <button onClick={handleBack} className="mt-auto pt-8 text-left text-sm" style={{ color: "#aaa" }}>
        ← Back
      </button>
    </div>
  );
}
