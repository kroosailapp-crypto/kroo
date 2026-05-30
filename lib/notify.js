import { supabase } from "@/lib/supabase";

export async function notify(payload) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return;
  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
