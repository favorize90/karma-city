"use client";

import { useState } from "react";
import { missions, MissionCategory } from "@/data/mockData";
import { KarmaCoinIcon } from "@/components/KarmaCoin";
import { MissionCard } from "@/components/MissionCard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Check, Leaf, Users, Palette, Monitor, UtensilsCrossed, Heart } from "lucide-react";
import Link from "next/link";

const interests: { key: MissionCategory; label: string; icon: React.ElementType; color: string }[] = [
  { key: "environment", label: "Umwelt", icon: Leaf, color: "emerald" },
  { key: "social", label: "Soziales", icon: Heart, color: "rose" },
  { key: "culture", label: "Kultur", icon: Palette, color: "violet" },
  { key: "digital", label: "Digital", icon: Monitor, color: "cyan" },
  { key: "food", label: "Ernährung", icon: UtensilsCrossed, color: "orange" },
  { key: "elderly", label: "Seniorenhilfe", icon: Users, color: "sky" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Set<MissionCategory>>(new Set());

  const toggleInterest = (key: MissionCategory) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  const recommended = missions.filter((m) => selected.has(m.category)).slice(0, 3);

  return (
    <div className="flex min-h-[100dvh] flex-col px-4 pt-10 pb-8 bg-white">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ width: i === step ? 32 : i < step ? 16 : 16, opacity: i <= step ? 1 : 0.3 }}
            className={`h-1.5 rounded-full ${i <= step ? "bg-emerald-500" : "bg-zinc-200"}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-1 flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-lime-50 border border-emerald-200/50"
            >
              <KarmaCoinIcon size={56} />
            </motion.div>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 font-display">
              Willkommen bei<br />Karma City
            </h1>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed max-w-[280px]">
              Mach Gutes für deine Stadt und werde dafür belohnt. Echt jetzt.
            </p>

            <div className="mt-8 space-y-3 w-full max-w-xs">
              {[
                { icon: Sparkles, title: "Missionen entdecken", desc: "Finde Einsätze in Soest", color: "emerald" },
                { icon: KarmaCoinIcon, title: "Karma-Punkte sammeln", desc: "Jede gute Tat zählt", color: "amber" },
                { icon: Sparkles, title: "Rewards kassieren", desc: "Freibad, Cafe, Kino und mehr", color: "violet" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 rounded-2xl bg-zinc-50 border border-zinc-100 p-4 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200/50 shadow-sm">
                      <Icon size={18} className="text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-800">{item.title}</p>
                      <p className="text-[11px] text-zinc-400">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-auto pt-8 w-full">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(1)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-sm font-bold text-white transition hover:bg-emerald-600 active:-translate-y-px"
              >
                Let&apos;s go <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-1 flex-col">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 font-display">Was ist dein Ding?</h1>
            <p className="mt-1 text-sm text-zinc-400">Wähle, was dir wichtig ist.</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {interests.map((item) => {
                const Icon = item.icon;
                const isSelected = selected.has(item.key);
                return (
                  <motion.button
                    key={item.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(item.key)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                      isSelected ? "border-zinc-900 bg-zinc-900" : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                      isSelected ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {isSelected ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? "text-white" : "text-zinc-700"}`}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-auto pt-8 flex gap-3">
              <button onClick={() => setStep(0)} className="flex items-center gap-1 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-500">
                <ArrowLeft size={14} />
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                disabled={selected.size === 0}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition ${
                  selected.size > 0 ? "bg-zinc-900 hover:bg-emerald-600" : "bg-zinc-300 cursor-not-allowed"
                }`}
              >
                Weiter <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-1 flex-col">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 font-display">Passt zu dir</h1>
            <p className="mt-1 text-sm text-zinc-400">Deine ersten Missionen, handverlesen.</p>

            <div className="mt-6 space-y-3">
              {recommended.length > 0 ? (
                recommended.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <MissionCard mission={m} />
                  </motion.div>
                ))
              ) : (
                <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-8 text-center">
                  <p className="text-sm text-zinc-400">Wähle Interessen aus für passende Missionen.</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-8 flex gap-3">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-500">
                <ArrowLeft size={14} />
              </button>
              <Link href="/app" className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98]">
                Loslegen <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
