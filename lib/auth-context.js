"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseReady } from "./supabase";

async function registerPushToken(userId) {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;
    if (Capacitor.getPlatform() === "android") return;

    const { receive } = await PushNotifications.checkPermissions();
    const status = receive === "granted"
      ? { receive: "granted" }
      : await PushNotifications.requestPermissions();

    if (status.receive !== "granted") return;

    await PushNotifications.register();

    PushNotifications.addListener("registration", async ({ value: token }) => {
      await supabase.from("push_tokens").upsert({
        user_id: userId,
        token,
        platform: Capacitor.getPlatform(),
        updated_at: new Date().toISOString(),
      });
    });
  } catch {
    // Not a native platform or plugin unavailable — silently ignore
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [crewProfile, setCrewProfile] = useState(null);
  const [boatProfile, setBoatProfile] = useState(null);
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    let subscription;
    supabaseReady.then(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfiles(session.user);
        else setProfilesLoaded(true);
      });

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfiles(session.user);
        else { setCrewProfile(null); setBoatProfile(null); setSuspended(false); setProfilesLoaded(true); }
      });
      subscription = sub;
    });

    return () => subscription?.unsubscribe();
  }, []);

  // After email confirmation, create the profile captured at signup.
  async function applyPending(user) {
    const pending = user.user_metadata?.pending_profile;
    if (!pending || !user.email_confirmed_at) return;
    const { kind, ...f } = pending;
    let error = null;
    if (kind === "crew") {
      ({ error } = await supabase.from("crew_profiles").insert({
        id: user.id, about: "", website: "", instagram: "",
        availability: [], interested_regattas: [], boat_classes: [], ...f,
      }));
    } else if (kind === "boat") {
      ({ error } = await supabase.from("boat_profiles").insert({
        id: user.id, about: "", photo_url: "", ...f,
      }));
    }
    if (kind === "pro_team") {
      const { data: team, error: teamErr } = await supabase.from("pro_teams").insert({ ...f, owner_id: user.id }).select().single();
      error = teamErr;
      if (team) {
        await supabase.from("pro_team_members").insert({
          team_id: team.id, user_id: user.id, role: "owner",
          name: f.contact_name, email: f.contact_email, phone: f.contact_phone,
        });
        await supabase.from("pro_chat_channels").insert([
          { team_id: team.id, name: "General", type: "general" },
          { team_id: team.id, name: "Shore Team", type: "shore" },
        ]);
      }
    } else if (kind === "pro_invite") {
      ({ error } = await supabase.from("pro_team_members").insert({
        team_id: f.team_id, user_id: user.id, role: f.role, name: f.name, email: f.email,
      }));
      await supabase.from("pro_invitations").update({ accepted_at: new Date().toISOString() }).eq("token", f.token);
    }
    if (!error || error.code === "23505" || error.message?.includes("duplicate")) {
      await supabase.auth.updateUser({ data: { pending_profile: null } });
    }
  }

  async function fetchProfiles(user) {
    let [{ data: crew }, { data: boat }, { data: suspension }] = await Promise.all([
      supabase.from("crew_profiles").select("*").eq("id", user.id).single(),
      supabase.from("boat_profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_suspensions").select("status").eq("user_id", user.id).maybeSingle(),
    ]);
    if (suspension?.status === "banned") {
      // Banned while still holding a session: log them out (a new login is refused)
      await supabase.auth.signOut();
      return;
    }
    setSuspended(!!suspension);
    if (user.user_metadata?.pending_profile && (!crew && !boat || user.user_metadata.pending_profile.kind?.startsWith("pro_"))) {
      await applyPending(user);
      [{ data: crew }, { data: boat }] = await Promise.all([
        supabase.from("crew_profiles").select("*").eq("id", user.id).single(),
        supabase.from("boat_profiles").select("*").eq("id", user.id).single(),
      ]);
    }
    setCrewProfile(crew || null);
    setBoatProfile(boat || null);
    setProfilesLoaded(true);
    registerPushToken(user.id);
  }

  async function refreshProfiles() {
    if (user) await fetchProfiles(user);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  // Legacy: single profile (whichever exists)
  const profile = boatProfile || crewProfile;

  return (
    <AuthContext.Provider value={{ user, profile, crewProfile, boatProfile, profilesLoaded, suspended, setCrewProfile, setBoatProfile, refreshProfiles, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
