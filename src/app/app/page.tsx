"use client";

import { missions, currentUser, communityStats } from "@/data/mockData";
import { CoinCounter } from "@/components/CoinCounter";
import { MissionCard } from "@/components/MissionCard";
import { MissionDetail } from "@/components/MissionDetail";
import { Avatar } from "@/components/Avatar";
import { KarmaCoinIcon } from "@/components/KarmaCoin";
import { Mission } from "@/data/mockData";
import { Users, CheckCircle2, Coins, ArrowRight, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const activeMissions = missions.slice(0, 4);

  return (
    <div className="px-4 pt-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Willkommen zurück</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">{currentUser.name}</h1>
        </div>
        <Link href="/app/profile">
          <Avatar name={currentUser.fullName} seed={currentUser.avatar} size="lg" level={currentUser.level} />
        </Link>
      </motion.div>

      {/* Coin Balance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5"
      >
        <CoinCounter value={currentUser.coins} />
      </motion.div>

      {/* Streak indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-4 flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-100 px-4 py-2.5"
      >
        <Flame size={16} className="text-orange-500" />
        <span className="text-xs font-semibold text-orange-700">7-Tage-Streak</span>
        <span className="text-xs text-orange-500">Bleib dran und verdopple deine Punkte!</span>
      </motion.div>

      {/* Community Impact Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5 grid grid-cols-3 gap-3"
      >
        <div className="rounded-2xl bg-white border border-zinc-100 p-3 text-center">
          <div className="flex items-center justify-center text-emerald-600 mb-1">
            <Coins size={16} />
          </div>
          <p className="text-lg font-bold font-mono text-zinc-800">{(communityStats.totalCoinsEarned / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-zinc-400 font-medium">Punkte stadtweit</p>
        </div>
        <div className="rounded-2xl bg-white border border-zinc-100 p-3 text-center">
          <div className="flex items-center justify-center text-emerald-600 mb-1">
            <Users size={16} />
          </div>
          <p className="text-lg font-bold font-mono text-zinc-800">{communityStats.activeVolunteersThisWeek}</p>
          <p className="text-[10px] text-zinc-400 font-medium">Aktive Helfer</p>
        </div>
        <div className="rounded-2xl bg-white border border-zinc-100 p-3 text-center">
          <div className="flex items-center justify-center text-emerald-600 mb-1">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-lg font-bold font-mono text-zinc-800">{communityStats.missionsCompletedTotal}</p>
          <p className="text-[10px] text-zinc-400 font-medium">Missionen erledigt</p>
        </div>
      </motion.div>

      {/* Active Missions Near You */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight font-display">Missionen in deiner Nähe</h2>
          <Link href="/app/missions" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition">
            Alle <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {activeMissions.map((mission, i) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
            >
              <MissionCard
                mission={mission}
                compact
                onSelect={setSelectedMission}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 mb-4"
      >
        <Link
          href="/app/missions"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-200/50 transition hover:bg-emerald-500 active:scale-[0.98]"
        >
          <KarmaCoinIcon size={20} />
          Mission finden und Punkte verdienen
        </Link>
      </motion.div>

      {/* Mission Detail Modal */}
      {selectedMission && (
        <MissionDetail mission={selectedMission} onClose={() => setSelectedMission(null)} />
      )}
    </div>
  );
}
