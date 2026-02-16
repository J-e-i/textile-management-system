// Fixed Frontend Login Check
const { data: { user } } = await supabase.auth.getUser();

// Check if user exists
if (!user) {
  alert("Please login first.");
  return;
}

// Check email confirmation (need to fetch from auth.users)
const { data: authUser } = await supabase
  .from("auth.users")
  .select("email_confirmed_at")
  .eq("id", user.id)
  .single();

if (!authUser?.email_confirmed_at) {
  alert("Please confirm your email first.");
  await supabase.auth.signOut();
  return;
}

// Check admin approval
const { data: profile } = await supabase
  .from("profiles")
  .select("approval_status")
  .eq("id", user.id)
  .single();

if (profile.approval_status !== "APPROVED") {
  alert("Admin approval pending.");
  await supabase.auth.signOut();
  return;
}

// User can proceed
console.log("User verified and approved");
