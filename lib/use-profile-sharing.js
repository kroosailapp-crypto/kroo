"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

// Owner-side logic for public share links: consent modal, is_public flag, share sheet.
// kind: "boat" | "crew" (table + link path derive from it).
export function useProfileSharing({ kind, id, name, isPublic, onPublicChange }) {
  const table = kind === "boat" ? "boat_profiles" : "crew_profiles";
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  function flash(msg) {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  }

  async function setPublic(value) {
    const { error } = await supabase.from(table).update({ is_public: value }).eq("id", id);
    if (error) {
      flash("Couldn't update sharing. Please try again.");
      return false;
    }
    onPublicChange(value);
    return true;
  }

  async function shareLink() {
    const url = `${window.location.origin}/share/${kind}/${id}`;
    const title = `${name} on Kroo Finder`;
    const text = kind === "boat" ? `${name} is looking for crew on Kroo Finder.` : `${name} is on Kroo Finder.`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied");
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  // "Share profile" button: skip the warning once the profile is already public.
  async function share() {
    if (isPublic) await shareLink();
    else setShowModal(true);
  }

  async function confirm() {
    setBusy(true);
    const ok = await setPublic(true);
    setBusy(false);
    if (!ok) return;
    setShowModal(false);
    await shareLink();
  }

  // Menu switch: off -> immediate; on -> goes through the warning modal.
  async function toggle() {
    if (isPublic) {
      if (await setPublic(false)) flash("Public profile turned off");
    } else {
      setShowModal(true);
    }
  }

  return { showModal, busy, notice, share, confirm, toggle, closeModal: () => setShowModal(false) };
}
