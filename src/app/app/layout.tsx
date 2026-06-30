import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { UserProvider, type Profile } from "@/components/UserProvider";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  // Profile should exist (created by trigger). If missing, bail to login.
  if (!profile) redirect("/login?error=missing-profile");

  return (
    <UserProvider profile={profile}>
      <div className="bg-[#fafafa] min-h-[100dvh]">
        <main className="mx-auto max-w-lg pb-20">{children}</main>
        <BottomNav />
      </div>
    </UserProvider>
  );
}
