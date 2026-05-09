"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
      className="flex items-center justify-center px-6 py-2 rounded-full font-medium text-sm mt-6"
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
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [positions, setPositions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  function togglePosition(pos) {
    setPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  async function handleFinish() {
    setError("");
    setLoading(true);
    try {
      // 1. Create auth user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { user_type: "crew" } },
      });
      if (signUpError) throw signUpError;

      // 2. Sign in immediately to establish a session
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // 3. Create crew profile
      const { error: profileError } = await supabase.from("crew_profiles").insert({
        id: data.user.id,
        name,
        location,
        experience_level: experience,
        positions,
        about: "",
        website: "",
        instagram: "",
        availability: [],
        interested_regattas: [],
        boat_classes: [],
      });
      if (profileError) throw profileError;

      router.push("/crew/profile");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleNext() {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleFinish();
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
    else router.push("/");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-5 py-5">
      <div className="mb-6">
        <Image src="/kroo-logo-blue.svg" alt="Kroo" width={60} height={24} />
      </div>

      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* Step 1 — Account */}
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

      {/* Step 2 — Location */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-800 font-semibold text-lg mb-1">Where are you based?</p>
          <Field placeholder="City, State (e.g. San Francisco, CA)" value={location} onChange={setLocation} />
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
          <NextButton onClick={handleNext} disabled={!location} />
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
