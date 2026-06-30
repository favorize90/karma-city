"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { MissionCard } from "@/components/MissionCard";
import { MissionDetail } from "@/components/MissionDetail";
import { Mission, MissionCategory } from "@/data/mockData";

const filters: { key: MissionCategory | "all"; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "social", label: "Soziales" },
  { key: "environment", label: "Umwelt" },
  { key: "culture", label: "Kultur" },
  { key: "elderly", label: "Senioren" },
  { key: "food", label: "Ernährung" },
  { key: "digital", label: "Digital" },
];

export function MissionsClient({ missions }: { missions: Mission[] }) {
  const [activeFilter, setActiveFilter] = useState<MissionCategory | "all">("all");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [search, setSearch] = useState("");

  const filtered = missions.filter((m) => {
    const matchesCategory = activeFilter === "all" || m.category === activeFilter;
    const matchesSearch =
      search === "" ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="px-4 pt-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight font-display">
              Missionen
            </h1>
            <p className="mt-0.5 text-xs text-zinc-400 font-medium">
              Finde deinen nächsten Einsatz
            </p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mt-4"
      >
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-300"
        />
        <input
          type="text"
          placeholder="Park, Senioren, Kultur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-200/60 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-700 placeholder:text-zinc-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition shadow-sm"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar pb-1"
      >
        {filters.map((f, i) => (
          <motion.button
            key={f.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.03 }}
            onClick={() => setActiveFilter(f.key)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
              activeFilter === f.key
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {f.label}
          </motion.button>
        ))}
      </motion.div>

      <div className="mt-4 flex items-center gap-1.5">
        <Sparkles size={11} className="text-emerald-500" />
        <p className="text-[11px] text-zinc-400 font-medium">
          {filtered.length} {filtered.length === 1 ? "Mission" : "Missionen"} verfügbar
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 pb-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onSelect={setSelectedMission}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center"
        >
          <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-3">
            <Search size={24} className="text-zinc-300" />
          </div>
          <p className="text-sm font-medium text-zinc-500">Keine Missionen gefunden</p>
          <button
            onClick={() => {
              setActiveFilter("all");
              setSearch("");
            }}
            className="mt-2 text-xs font-semibold text-emerald-600"
          >
            Filter zurücksetzen
          </button>
        </motion.div>
      )}

      {selectedMission && (
        <MissionDetail
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </div>
  );
}
