"use client";

import { achievements, levelConfig } from "@/data/mockData";
import { useProfile, type ProfileLevel } from "@/components/UserProvider";
import { Avatar } from "@/components/Avatar";
import { CoinCounter } from "@/components/CoinCounter";
import { motion } from "framer-motion";
import {
  Rocket,
  Leaf,
  Monitor,
  Heart,
  Palette,
  Sunrise,
  Users,
  Trophy,
  Lock,
  Settings,
  LogOut,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  rocket: Rocket,
  leaf: Leaf,
  monitor: Monitor,
  heart: Heart,
  palette: Palette,
  sunrise: Sunrise,
  users: Users,
  trophy: Trophy,
};

const nextLevelMap: Record<ProfileLevel, { name: ProfileLevel; threshold: number } | null> = {
  Bronze: { name: "Silber", threshold: 300 },
  Silber: { name: "Gold", threshold: 700 },
  Gold: { name: "Platin", threshold: 1200 },
  Platin: null,
};

export default function ProfilePage() {
  const profile = useProfile();
  const coinsForCurrent = levelConfig[profile.level].min;
  const next = nextLevelMap[profile.level];
  const coinsForNext = next?.threshold ?? profile.total_coins_earned;
  const nextLevelName = next?.name ?? profile.level;
  const progress = next
    ? ((profile.total_coins_earned - coinsForCurrent) / (coinsForNext - coinsForCurrent)) * 100
    : 100;
  const displayName =
    profile.full_name || profile.display_name || "Karma-Bürger";

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        <button className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 transition">
          <Settings size={18} />
        </button>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 rounded-2xl bg-white border border-zinc-100 p-5"
      >
        <div className="flex items-center gap-4">
          <Avatar
            name={displayName}
            seed={profile.avatar_seed || profile.id}
            size="xl"
            level={profile.level}
          />
          <div>
            <h2 className="text-lg font-bold text-zinc-800">{displayName}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${levelConfig[profile.level].bg} ${levelConfig[profile.level].color}`}>
                {profile.level}
              </span>
              {profile.district && (
                <span className="text-xs text-zinc-400">{profile.district}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Dabei seit {new Date(profile.joined_at).toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <CoinCounter value={profile.coins} />
        </div>

        {/* Level progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-600">{profile.level}</span>
            <span className="font-medium text-zinc-600">{nextLevelName}</span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-full bg-zinc-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-karma-green to-karma-green-light"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-400">
            {next ? (
              <>
                Noch <span className="font-mono font-semibold text-zinc-600">{Math.max(coinsForNext - profile.total_coins_earned, 0)}</span> Coins bis {nextLevelName}
              </>
            ) : (
              <>Höchstes Level erreicht 🌟</>
            )}
          </p>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-50 p-3 text-center">
            <p className="text-xl font-bold font-mono text-zinc-800">{profile.missions_completed}</p>
            <p className="text-[10px] text-zinc-400 font-medium">Missionen</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 text-center">
            <p className="text-xl font-bold font-mono text-zinc-800">{profile.total_coins_earned}</p>
            <p className="text-[10px] text-zinc-400 font-medium">Coins verdient</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6"
      >
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">Abzeichen</h2>
        <div className="grid grid-cols-4 gap-3">
          {achievements.map((a, i) => {
            const Icon = iconMap[a.icon] || Trophy;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center ${
                  a.unlocked
                    ? "bg-white border border-zinc-100"
                    : "bg-zinc-50 border border-zinc-100 opacity-50"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  a.unlocked ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                }`}>
                  {a.unlocked ? <Icon size={18} /> : <Lock size={14} />}
                </div>
                <p className="text-[10px] font-medium text-zinc-700 leading-tight">{a.name}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Activity history */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">Letzte Aktivitäten</h2>
        {profile.missions_completed === 0 ? (
          <div className="rounded-2xl bg-white border border-zinc-100 px-4 py-6 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <Trophy size={16} className="text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-zinc-700">Noch keine Missionen abgeschlossen</p>
            <p className="mt-1 text-[11px] text-zinc-400">
              Finde deine erste Mission und sammle deine ersten Karma-Punkte.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-zinc-100 px-4 py-4 text-center">
            <p className="text-xs text-zinc-400">
              <span className="font-mono font-semibold text-zinc-700">{profile.missions_completed}</span> Missionen abgeschlossen.
              Detaillierte Historie folgt im nächsten Sprint.
            </p>
          </div>
        )}
      </motion.div>

      {/* Account section with logout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 mb-2"
      >
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">Konto</h2>
        <form action="/logout" method="post">
          <button
            type="submit"
            className="group flex w-full items-center justify-between rounded-2xl bg-white border border-zinc-100 px-4 py-3.5 text-left transition hover:border-rose-200 hover:bg-rose-50/40 active:scale-[0.99]"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition group-hover:bg-rose-100">
                <LogOut size={14} />
              </span>
              <span>
                <span className="block text-sm font-medium text-zinc-700">Abmelden</span>
                <span className="block text-[11px] text-zinc-400">
                  Du kannst dich jederzeit wieder anmelden
                </span>
              </span>
            </span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
