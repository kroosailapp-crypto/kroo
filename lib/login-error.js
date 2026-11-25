// Banned accounts are NOT blocked by Supabase at login, because that would
// reveal the ban to anyone who guesses the email (a wrong password on a banned
// account would also say "banned"). Instead the password is checked normally,
// and only someone who got it right sees the ban message and is signed out.
export const BANNED_MESSAGE = "This account has been banned.";

export async function signInChecked(supabase, email, password) {
  const res = await supabase.auth.signInWithPassword({ email, password });
  if (res.error) return res;

  const { data: restriction } = await supabase
    .from("user_suspensions")
    .select("status")
    .eq("user_id", res.data.user.id)
    .maybeSingle();

  if (restriction?.status === "banned") {
    await supabase.auth.signOut();
    return { data: { user: null, session: null }, error: { message: BANNED_MESSAGE, code: "user_banned" } };
  }
  return res;
}

export function loginErrorMessage(error) {
  return error ? error.message : "";
}
