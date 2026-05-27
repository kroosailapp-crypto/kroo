"use client";
import { useState, useRef, useEffect } from "react";

function formatSuggestion(item) {
  const a = item.address || {};
  const city = a.city || a.town || a.village || a.municipality || a.county || "";
  const state = a.state || "";
  const country = a.country || "";
  const cc = (a.country_code || "").toUpperCase();

  if (!city) return null;
  if (cc === "US") return state ? `${city}, ${state}` : city;
  return country ? `${city}, ${country}` : city;
}

export default function LocationInput({ value, onChange, placeholder, className, style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  function handleChange(e) {
    const val = e.target.value;
    onChange(val);

    clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=6`,
          { headers: { "Accept-Language": "en-US,en" } }
        );
        const data = await res.json();

        // Keep only city/town/village/suburb results, dedupe
        const seen = new Set();
        const items = [];
        for (const item of data) {
          if (!["city", "town", "village", "suburb", "municipality", "administrative"].includes(item.addresstype)) continue;
          const label = formatSuggestion(item);
          if (!label || seen.has(label)) continue;
          seen.add(label);
          items.push(label);
        }

        setSuggestions(items);
        setOpen(items.length > 0);
      } catch {
        // silently fail — user can still type freely
      }
    }, 350);
  }

  function handleSelect(label) {
    onChange(label);
    setSuggestions([]);
    setOpen(false);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete="off"
      />
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-lg z-30 overflow-hidden border"
          style={{ borderColor: "#e0e0e0" }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 border-b last:border-0"
              style={{ borderColor: "#f0f0f0" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
