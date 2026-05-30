import { supabase } from "@/lib/supabase";

export async function fetchAdminIds() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return [];
  const res = await fetch("/api/admin/ids", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const { ids } = await res.json();
  return ids || [];
}
