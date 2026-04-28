"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Trophy, Gift, User } from "lucide-react";

const navItems = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/missions", label: "Missionen", icon: Target },
  { href: "/app/leaderboard", label: "Rangliste", icon: Trophy },
  { href: "/app/rewards", label: "Rewards", icon: Gift },
  { href: "/app/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-900/5 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-semibold tracking-wide uppercase transition-colors ${
                isActive
                  ? "text-emerald-600"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <div className={`rounded-xl p-1.5 transition-colors ${isActive ? "bg-emerald-50" : ""}`}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.5}
                />
              </div>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
