"use client";

import { Mission, categoryLabels, categoryColors } from "@/data/mockData";
import { KarmaCoinBadge } from "./KarmaCoin";
import { MapPin, Clock, Star, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={10}
          strokeWidth={1.5}
          className={i <= level ? "fill-amber-400 text-amber-400" : "text-zinc-200"}
        />
      ))}
    </span>
  );
}

export function MissionCard({
  mission,
  onSelect,
  compact = false,
}: {
  mission: Mission;
  onSelect?: (m: Mission) => void;
  compact?: boolean;
}) {
  const urgency = mission.participantsCurrent / mission.participantsMax;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.97, y: -1 }}
      onClick={() => onSelect?.(mission)}
      className="group cursor-pointer overflow-hidden rounded-[1.25rem] border border-zinc-200/50 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]"
    >
      {/* Image */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-emerald-50 to-zinc-100">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: `url(https://picsum.photos/seed/${mission.imageSeed}/600/400)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent" />

        {/* Category pill */}
        <div className="absolute left-2.5 top-2.5">
          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${categoryColors[mission.category]}`}>
            {categoryLabels[mission.category]}
          </span>
        </div>

        {/* Coin reward - floating */}
        <div className="absolute right-2.5 top-2.5">
          <KarmaCoinBadge coins={mission.coins} size="sm" />
        </div>

        {/* Urgency indicator */}
        {urgency > 0.7 && (
          <div className="absolute left-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-lg bg-rose-500/90 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
            <Zap size={8} /> Fast voll
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-[13px] font-bold text-zinc-900 leading-snug line-clamp-2 font-display">
          {mission.title}
        </h3>

        {!compact && (
          <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
            {mission.description}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] text-zinc-400">
          <span className="inline-flex items-center gap-0.5">
            <MapPin size={10} strokeWidth={2} /> {mission.distance}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Clock size={10} strokeWidth={2} /> {mission.deadline.split(",")[0]}
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DifficultyStars level={mission.difficulty} />
            <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-300">
              <Users size={9} />
              {mission.participantsCurrent}/{mission.participantsMax}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(mission);
            }}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider transition-all hover:bg-emerald-600 active:scale-[0.95] active:-translate-y-px"
          >
            Go
          </button>
        </div>
      </div>
    </motion.div>
  );
}
