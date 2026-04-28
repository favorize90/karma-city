"use client";

import { currentUser, achievements, levelConfig } from "@/data/mockData";
import { Avatar } from "@/components/Avatar";
import { CoinCounter } from "@/components/CoinCounter";
import { KarmaCoinBadge } from "@/components/KarmaCoin";
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
  Calendar,
  Settings,
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

export default function ProfilePage() {
  const coinsForCurrent = levelConfig[currentUser.level].min;
  const coinsForNext = currentUser.coinsForNextLevel;
  const progress = ((currentUser.totalCoinsEarned - coinsForCurrent) / (coinsForNext - coinsForCurrent)) * 100;

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
          <Avatar name={currentUser.fullName} seed={currentUser.avatar} size="xl" level={currentUser.level} />
          <div>
            <h2 className="text-lg font-bold text-zinc-800">{currentUser.fullName}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${levelConfig[currentUser.level].bg} ${levelConfig[currentUser.level].color}`}>
                {currentUser.level}
              </span>
              <span className="text-xs text-zinc-400">Rang #{currentUser.rank}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">Dabei seit {new Date(currentUser.joinedDate).toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</p>
          </div>
        </div>

        <div className="mt-5">
          <CoinCounter value={currentUser.coins} />
        </div>

        {/* Level progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-600">{currentUser.level}</span>
            <span className="font-medium text-zinc-600">{currentUser.nextLevel}</span>
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
            Noch <span className="font-mono font-semibold text-zinc-600">{coinsForNext - currentUser.totalCoinsEarned}</span> Coins bis {currentUser.nextLevel}
          </p>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-50 p-3 text-center">
            <p className="text-xl font-bold font-mono text-zinc-800">{currentUser.missionsCompleted}</p>
            <p className="text-[10px] text-zinc-400 font-medium">Missionen</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 text-center">
            <p className="text-xl font-bold font-mono text-zinc-800">{currentUser.totalCoinsEarned}</p>
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
        <div className="space-y-2">
          {currentUser.completedMissions.map((cm, i) => (
            <motion.div
              key={cm.missionId + cm.date}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="flex items-center gap-3 rounded-2xl bg-white border border-zinc-100 px-4 py-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <Trophy size={14} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-700 truncate">{cm.title}</p>
                <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(cm.date).toLocaleDateString("de-DE")}
                </p>
              </div>
              <KarmaCoinBadge coins={cm.coinsEarned} size="sm" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
