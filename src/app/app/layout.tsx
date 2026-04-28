import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#fafafa] min-h-[100dvh]">
      <main className="mx-auto max-w-lg pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
