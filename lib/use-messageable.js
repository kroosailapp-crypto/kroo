"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";

// Who can the signed-in user message right now? Backed by the
// messageable_users() database function, which applies the messaging rules
// (see supabase/message_rules.sql):
//   boat -> sailor : the sailor applied to one of the boat's positions
//   sailor -> boat : the boat invited them, or selected them for a position
//   either way     : once someone has written, the other side can reply
// The database also enforces this on every insert, so this only drives the UI.
// Several components on a page can call the hook; share one request.
let cached = null; // { uid, at, promise }
function fetchIds(uid) {
  if (cached && cached.uid === uid && Date.now() - cached.at < 15000) return cached.promise;
  const promise = supabase.rpc("messageable_users").then(({ data, error }) => new Set(error ? [] : data || []));
  cached = { uid, at: Date.now(), promise };
  return promise;
}

export function useMessageable() {
  const { user } = useAuth();
  const [ids, setIds] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchIds(user.id).then((set) => { if (!cancelled) setIds(set); });
    return () => { cancelled = true; };
  }, [user]);

  return {
    loaded: ids !== null,
    canMessage: (id) => !!ids && ids.has(id),
  };
}
