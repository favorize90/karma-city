"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { KarmaCoinIcon } from "@/components/KarmaCoin";
import {
  ArrowLeft,
  ScanLine,
  CheckCircle2,
  Gift,
  Clock,
  TrendingUp,
} from "lucide-react";

type ScanState = "idle" | "scanning" | "success";

export default function PartnerPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");

  const handleScan = () => {
    setScanState("scanning");
    setTimeout(() => setScanState("success"), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-white">
      {/* Header */}
      <div className="border-b border-zinc-100 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-zinc-400 hover:text-zinc-600 transition">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <KarmaCoinIcon size={20} />
              <span className="font-display text-sm font-bold tracking-tight">Partner-Terminal</span>
            </div>
          </div>
          <span className="text-xs text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-lg">Cafe Fromme</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-center">
            <Gift size={14} className="mx-auto text-emerald-600 mb-1" />
            <p className="text-lg font-bold font-mono text-zinc-800">83</p>
            <p className="text-[10px] text-zinc-400">Einlösungen</p>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-center">
            <Clock size={14} className="mx-auto text-sky-600 mb-1" />
            <p className="text-lg font-bold font-mono text-zinc-800">12</p>
            <p className="text-[10px] text-zinc-400">Diese Woche</p>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-center">
            <TrendingUp size={14} className="mx-auto text-amber-600 mb-1" />
            <p className="text-lg font-bold font-mono text-zinc-800">+23%</p>
            <p className="text-[10px] text-zinc-400">Trend</p>
          </div>
        </div>

        {/* Scan area */}
        <AnimatePresence mode="wait">
          {scanState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div className="relative mx-auto mb-6">
                <div className="h-64 w-64 mx-auto rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center">
                  <ScanLine size={48} className="text-zinc-300 mb-3" />
                  <p className="text-sm font-medium text-zinc-500">QR-Code des Kunden scannen</p>
                  <p className="text-[11px] text-zinc-400 mt-1">oder Code manuell eingeben</p>
                </div>
              </div>

              <button
                onClick={handleScan}
                className="w-full rounded-2xl bg-zinc-900 py-4 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
              >
                QR-Code scannen
              </button>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-px bg-zinc-100" />
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">oder</span>
                  <div className="flex-1 h-px bg-zinc-100" />
                </div>
                <input
                  placeholder="Code eingeben (z.B. KC-2026-0847)"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-center font-mono text-zinc-600 placeholder:text-zinc-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </motion.div>
          )}

          {scanState === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="h-64 w-64 mx-auto rounded-3xl border-2 border-emerald-300 bg-emerald-50 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                <motion.div
                  animate={{ y: [-100, 100] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-x-4 h-0.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"
                />
                <ScanLine size={48} className="text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-zinc-600">Scanne QR-Code...</p>
            </motion.div>
          )}

          {scanState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                className="h-20 w-20 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mb-6"
              >
                <CheckCircle2 size={40} className="text-emerald-500" />
              </motion.div>

              <h2 className="text-xl font-extrabold text-zinc-900 font-display">Gutschein eingelöst!</h2>

              <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Kunde</span>
                  <span className="font-medium text-zinc-700">Max B.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Reward</span>
                  <span className="font-medium text-zinc-700">Cafe Gutschein 5 Euro</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Code</span>
                  <span className="font-mono text-xs text-zinc-600">KC-2026-0847</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Eingelöst</span>
                  <span className="font-medium text-zinc-700">Gerade eben</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm">
                  <span className="text-zinc-400">Karma-Punkte abgezogen</span>
                  <span className="font-bold text-amber-600">-30</span>
                </div>
              </div>

              <button
                onClick={() => setScanState("idle")}
                className="mt-6 w-full rounded-2xl bg-zinc-900 py-4 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.98]"
              >
                Nächsten Gutschein scannen
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent redemptions */}
        <div className="mt-10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Letzte Einlösungen</h3>
          <div className="space-y-2">
            {[
              { name: "Lena P.", reward: "Cafe Gutschein 5 Euro", time: "vor 2 Std.", coins: 30 },
              { name: "Florian W.", reward: "Cafe Gutschein 5 Euro", time: "vor 5 Std.", coins: 30 },
              { name: "Ayse K.", reward: "Cafe Gutschein 5 Euro", time: "gestern", coins: 30 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-3"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                  {item.name.split(" ").map(w => w[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-700">{item.name} -- {item.reward}</p>
                  <p className="text-[10px] text-zinc-400">{item.time}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-600">-{item.coins}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
