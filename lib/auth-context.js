"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

async function registerPushToken(userId) {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfiles(session.user);
      else setProfilesLoaded(true); // no session → no profiles to load
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfiles(session.user);
      else { setCrewProfile(null); setBoatProfile(null); setProfilesLoaded(true); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfiles(user) {
    const [{ data: crew }, { data: boat }] = await Promise.all([
      supabase.from("crew_profiles").select("*").eq("id", user.id).single(),
      supabase.from("boat_profiles").select("*").eq("id", user.id).single(),
    ]);
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
    <AuthContext.Provider value={{ user, profile, crewProfile, boatProfile, profilesLoaded, setCrewProfile, setBoatProfile, refreshProfiles, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
