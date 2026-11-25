// Friendly text for a failed sign-in. Banned accounts are blocked by Supabase
// at login (error code "user_banned"); there is no way to appeal from here.
export function loginErrorMessage(error) {
  if (!error) return "";
  if (error.code === "user_banned" || /banned/i.test(error.message || "")) {
    return "This account has been banned.";
  }
  return error.message;
}
