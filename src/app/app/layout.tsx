import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side gate: middleware already redirects, this is a belt-and-braces check
  // so server components downstream can safely assume a session exists.
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirect=/app");
  } catch {
    // Supabase not configured yet — let dev see the app with mock data
  }

  return (
    <div className="bg-[#fafafa] min-h-[100dvh]">
      <main className="mx-auto max-w-lg pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
