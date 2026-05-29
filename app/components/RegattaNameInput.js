"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const KNOWN_REGATTAS = [
  "Rolex Big Boat Series",
  "Rolex Sydney Hobart Yacht Race",
  "Rolex Fastnet Race",
  "Rolex Middle Sea Race",
  "Rolex Cup",
  "Newport Bermuda Race",
  "Chicago Yacht Club Race to Mackinac",
  "Transpac Race",
  "Antigua Sailing Week",
  "Key West Race Week",
  "Block Island Race Week",
  "Marblehead to Halifax Race",
  "Caribbean 600",
  "Oyster Regatta",
  "Maxi Yacht Rolex Cup",
  "TP52 World Championship",
  "J/24 World Championship",
  "J/70 World Championship",
  "Melges 24 World Championship",
  "Etchells World Championship",
  "Snipe World Championship",
  "470 World Championship",
  "49er World Championship",
  "Finn Gold Cup",
  "Star World Championship",
  "Moth World Championship",
  "RS Aero World Championship",
  "Laser / ILCA World Championship",
  "Optimist World Championship",
  "Nacra 17 World Championship",
  "San Francisco Big Boat Series",
  "Sperry Charleston Race Week",
  "Sail Port Stephens",
  "Hamilton Island Race Week",
  "Land Rover Sydney Gold Coast Yacht Race",
  "Coastal Classic",
  "Sevenstar Round Britain and Ireland Race",
  "Round the Island Race",
  "The Ocean Race",
  "Jules Verne Trophy",
  "Volvo Ocean Race",
  "SailGP",
  "America's Cup",
  "Louis Vuitton Cup",
];

export default function RegattaNameInput({ value, onChange, placeholder, className, style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // Query existing regattas from DB
      const { data } = await supabase
        .from("regattas")
        .select("name")
        .ilike("name", `%${q}%`)
        .limit(10);

      const dbNames = [...new Set((data || []).map((r) => r.name))];

      // Filter known regattas list
      const knownMatches = KNOWN_REGATTAS.filter((r) =>
        r.toLowerCase().includes(q.toLowerCase())
      );

      // Merge: DB results first, then known (deduplicated)
      const merged = [...dbNames];
      for (const r of knownMatches) {
        if (!merged.some((m) => m.toLowerCase() === r.toLowerCase())) {
          merged.push(r);
        }
      }

      setSuggestions(merged.slice(0, 8));
      setOpen(merged.length > 0);
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [value]);

  function select(name) {
    onChange(name);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border z-50 overflow-hidden"
          style={{ borderColor: "#e0e0e0" }}
        >
          {suggestions.map((name) => (
            <button
              key={name}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(name); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 border-b last:border-b-0"
              style={{ borderColor: "#f0f0f0" }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
