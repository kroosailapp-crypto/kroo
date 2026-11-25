// Banned accounts are refused by the database's access-token hook
// (supabase/ban_hook.sql) after the password is verified, so Supabase returns
// "This account has been banned." only for the right password. A wrong password
// still gets the normal "Invalid login credentials".
export function loginErrorMessage(error) {
  return error ? error.message : "";
}
