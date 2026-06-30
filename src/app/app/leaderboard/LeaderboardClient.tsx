"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, MapPin } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { KarmaCoinBadge } from "@/components/KarmaCoin";
import { useProfile } from "@/components/UserProvider";
import type { LeaderboardRow } from "@/lib/db/queries";

type Props = {
  rows: LeaderboardRow[];
  districtStats: { name: string; missions: number }[];
};

function nextLevelGap(coins: number) {
  if (coins >= 1200) return null;
  if (coins >= 700) return { target: 1200, name: "Platin" as const };
  if (coins >= 300) return { target: 700, name: "Gold" as const };
  return { target: 300, name: "Silber" as const };
}

export function LeaderboardClient({ rows, districtStats }: Props) {
  const profile = useProfile();
  const [tab, setTab] = useState<"weekly" | "alltime">("alltime");
  const sorted = rows;
  const top = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const myRank = sorted.findIndex((r) => r.id === profile.id);
  const gap = nextLevelGap(profile.coins);

  const podiumPlaceholder = (rank: number): LeaderboardRow => ({
    id: `placeholder-${rank}`,
    display_name: "–",
    full_name: "Noch frei",
    avatar_seed: null,
    district: null,
    level: "Bronze",
    coins: 0,
    missions_completed: 0,
  });
  const podium = [
    top[1] ?? podiumPlaceholder(2),
    top[0] ?? podiumPlaceholder(1),
    top[2] ?? podiumPlaceholder(3),
  ];

  const nameOf = (r: LeaderboardRow) =>
    r.display_name || r.full_name?.split(" ")[0] || "Anonym";
  const fullNameOf = (r: LeaderboardRow) => r.full_name || nameOf(r);

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold tracking-tight">Rangliste</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Die aktivsten Helfer der Community
      </p>

      <div className="mt-5 flex rounded-xl bg-white border border-zinc-200 p-1">
        <button
          onClick={() => setTab("weekly")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
            tab === "weekly" ? "bg-karma-green text-white shadow-sm" : "text-zinc-400"
          }`}
        >
          Diese Woche
        </button>
        <button
          onClick={() => setTab("alltime")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
            tab === "alltime" ? "bg-karma-green text-white shadow-sm" : "text-zinc-400"
          }`}
        >
          Gesamt
        </button>
      </div>

      <div className="mt-6 flex items-end justify-center gap-3">
        {/* 2nd */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center"
        >
          <Avatar
            name={fullNameOf(podium[0])}
            seed={podium[0].avatar_seed || podium[0].id}
            size="lg"
            level={podium[0].level}
          />
          <p className="mt-2 text-xs font-semibold text-zinc-700 text-center leading-tight">
            {nameOf(podium[0])}
          </p>
          <KarmaCoinBadge coins={podium[0].coins} size="sm" />
          <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
            <Medal size={20} />
          </div>
        </motion.div>

        {/* 1st */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col items-center -mt-4"
        >
          <div className="relative">
            <Avatar
              name={fullNameOf(podium[1])}
              seed={podium[1].avatar_seed || podium[1].id}
              size="xl"
              level={podium[1].level}
            />
            <div className="absolute -top-2 -right-2 rounded-full bg-amber-400 p-1.5 shadow-md">
              <Trophy size={14} className="text-white" />
            </div>
          </div>
          <p className="mt-2 text-sm font-bold text-zinc-800 text-center leading-tight">
            {nameOf(podium[1])}
          </p>
          <KarmaCoinBadge coins={podium[1].coins} size="md" />
          <div className="mt-2 flex h-20 w-16 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-500">
            <Trophy size={24} />
          </div>
        </motion.div>

        {/* 3rd */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-center"
        >
          <Avatar
            name={fullNameOf(podium[2])}
            seed={podium[2].avatar_seed || podium[2].id}
            size="lg"
            level={podium[2].level}
          />
          <p className="mt-2 text-xs font-semibold text-zinc-700 text-center leading-tight">
            {nameOf(podium[2])}
          </p>
          <KarmaCoinBadge coins={podium[2].coins} size="sm" />
          <div className="mt-2 flex h-14 w-16 items-center justify-center rounded-xl bg-amber-50/50 border border-amber-100 text-amber-400">
            <Medal size={18} />
          </div>
        </motion.div>
      </div>

      <div className="mt-6 space-y-2">
        {rest.map((member, i) => {
          const rank = i + 4;
          const isCurrentUser = member.id === profile.id;
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                isCurrentUser
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-white border border-zinc-100"
              }`}
            >
              <span className="w-6 text-center text-xs font-mono font-bold text-zinc-400">
                {rank}
              </span>
              <Avatar
                name={fullNameOf(member)}
                seed={member.avatar_seed || member.id}
                size="sm"
                level={member.level}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 truncate">
                  {nameOf(member)}
                  {isCurrentUser && (
                    <span className="ml-1.5 text-[10px] text-emerald-600 font-semibold">
                      (Du)
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {member.missions_completed} Missionen
                </p>
              </div>
              <KarmaCoinBadge coins={member.coins} size="sm" />
            </motion.div>
          );
        })}
      </div>

      {/* Your position highlight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-4 rounded-2xl bg-karma-green/5 border border-karma-green/20 p-4"
      >
        <div className="flex items-center gap-3">
          <Avatar
            name={profile.full_name || profile.display_name || "Du"}
            seed={profile.avatar_seed || profile.id}
            size="md"
            level={profile.level}
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-800">
              {myRank >= 0 ? `Dein Rang: #${myRank + 1}` : "Noch nicht gerankt"}
            </p>
            <p className="text-xs text-zinc-500">
              {gap
                ? `Noch ${gap.target - profile.coins} Coins bis ${gap.name}-Status`
                : "Höchstes Level erreicht 🌟"}
            </p>
          </div>
          <KarmaCoinBadge coins={profile.coins} size="sm" />
        </div>
      </motion.div>

      {districtStats.length > 0 && (
        <div className="mt-6 mb-4">
          <h2 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-1.5">
            <MapPin size={14} /> Aktivste Stadtteile
          </h2>
          <div className="space-y-2">
            {districtStats.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium text-zinc-600 truncate">
                  {d.name}
                </span>
                <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(d.missions / districtStats[0].missions) * 100}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                    className="h-full rounded-full bg-karma-green"
                    style={{ opacity: 1 - i * 0.15 }}
                  />
                </div>
                <span className="text-xs font-mono text-zinc-400 w-8 text-right">
                  {d.missions}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
